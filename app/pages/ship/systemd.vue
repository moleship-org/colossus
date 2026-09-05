<script setup lang="ts">
definePageMeta({
    layout: 'default',
    middleware: ['auth'],
})

useHead({
    title: 'Systemd',
})

const unit = ref('')
const result = ref<unknown>()
const errorMessage = ref('')
const activeOperation = ref('')

const formattedResult = computed(() => {
    if (activeOperation.value) {
        return 'Loading...'
    }

    if (result.value === undefined) {
        return 'No request made yet.'
    }

    if (typeof result.value === 'string') {
        return result.value
    }

    return JSON.stringify(result.value, null, 2)
})

async function runOperation(operation: string) {
    const selectedUnit = unit.value.trim()

    if (operation !== 'daemon-reload' && !selectedUnit) {
        errorMessage.value = 'Enter a unit name.'
        result.value = undefined
        return
    }

    errorMessage.value = ''
    result.value = undefined
    activeOperation.value = operation

    try {
        if (operation === 'daemon-reload') {
            await callApi('/systemd/daemon-reload', { method: 'POST' })
            result.value = 'Daemon reload completed.'
        } else if (operation === 'status') {
            const encodedUnit = encodeURIComponent(selectedUnit)
            const response = await callApi<string>(`/systemd/units/${encodedUnit}/status`, {
                responseType: 'text',
            })
            result.value = JSON.parse(response)
        } else {
            const encodedUnit = encodeURIComponent(selectedUnit)
            await callApi(`/systemd/units/${encodedUnit}/${operation}`, { method: 'POST' })
            result.value = `${operation.charAt(0).toUpperCase() + operation.slice(1)} completed for ${selectedUnit}.`
        }
    } catch (err) {
        errorMessage.value = getErrorMessage(err)
        result.value = undefined
    } finally {
        activeOperation.value = ''
    }
}
</script>

<template>
    <div class="flex flex-col gap-8 p-6 md:p-8">
        <div>
            <h1 class="mt-2 text-2xl font-medium text-neutral-900 dark:text-white">
                Systemd
            </h1>
        </div>

        <section class="flex flex-col gap-4">
            <label for="systemd-unit"
                class="font-mono text-[11px] uppercase tracking-widest text-neutral-400 dark:text-neutral-600">
                Unit
            </label>

            <div
                class="flex min-w-0 items-center border-b border-neutral-200 text-sm text-neutral-900 focus-within:border-neutral-900 dark:border-neutral-800 dark:text-white dark:focus-within:border-white">
                <span class="shrink-0 py-2 text-neutral-400 dark:text-neutral-600">systemd/units/</span>
                <input id="systemd-unit" v-model="unit" type="text" autocomplete="off" placeholder="nginx"
                    class="min-w-0 flex-1 border-0 bg-transparent py-2 pl-0.5 outline-none placeholder:text-neutral-400 dark:placeholder:text-neutral-600">
            </div>

            <div class="flex flex-wrap gap-2">
                <button v-for="operation in ['status', 'stop', 'start', 'restart']" :key="operation"
                    type="button" :disabled="Boolean(activeOperation)" @click="runOperation(operation)"
                    class="inline-flex cursor-pointer items-center justify-center border border-neutral-900 px-4 py-2 text-sm font-medium text-neutral-900 transition-colors hover:bg-neutral-900 hover:text-white disabled:cursor-not-allowed disabled:opacity-60 dark:border-white dark:text-white dark:hover:bg-white dark:hover:text-neutral-900">
                    {{ activeOperation === operation ? 'Loading...' : operation }}
                </button>
            </div>

            <p v-if="errorMessage" class="text-sm text-red-500 dark:text-red-400">
                {{ errorMessage }}
            </p>
        </section>

        <section class="flex flex-col gap-4">
            <div class="flex flex-wrap items-center justify-between gap-3">
                <h2 class="font-mono text-[11px] uppercase tracking-widest text-neutral-400 dark:text-neutral-600">
                    Daemon
                </h2>
                <button type="button" :disabled="Boolean(activeOperation)" @click="runOperation('daemon-reload')"
                    class="inline-flex cursor-pointer items-center justify-center border border-neutral-900 bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200">
                    {{ activeOperation === 'daemon-reload' ? 'Loading...' : 'Daemon reload' }}
                </button>
            </div>
        </section>

        <section class="flex flex-col gap-3">
            <h2 class="font-mono text-[11px] uppercase tracking-widest text-neutral-400 dark:text-neutral-600">
                Response body
            </h2>
            <pre
                class="min-h-40 overflow-x-auto border border-neutral-200 bg-neutral-50 p-4 text-xs leading-relaxed whitespace-pre-wrap wrap-break-word text-neutral-700 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300">{{ formattedResult }}</pre>
        </section>
    </div>
</template>