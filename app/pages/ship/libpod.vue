<script setup lang="ts">
definePageMeta({
    layout: 'default',
    middleware: ['auth'],
})

useHead({
    title: 'Libpod',
})

const resource = ref('')
const result = ref<unknown>()
const errorMessage = ref('')
const isLoading = ref(false)

const formattedResult = computed(() => {
    if (result.value === undefined) {
        return 'No request made yet.'
    }

    if (typeof result.value === 'string') {
        return result.value
    }

    return JSON.stringify(result.value, null, 2)
})

async function handleSubmit() {
    const path = resource.value.trim()

    if (!path) {
        errorMessage.value = 'Enter a resource to search.'
        result.value = undefined
        return
    }

    errorMessage.value = ''
    result.value = undefined
    isLoading.value = true

    try {
        const encodedPath = path.split('/').map(encodeURIComponent).join('/')
        result.value = await callApi(`/libpod/${encodedPath}`)
    } catch (err) {
        errorMessage.value = getErrorMessage(err)
    } finally {
        isLoading.value = false
    }
}
</script>

<template>
    <div class="flex flex-col gap-8 p-6 md:p-8">
        <div>
            <h1 class="mt-2 text-2xl font-medium text-neutral-900 dark:text-white">
                Libpod
            </h1>
        </div>

        <form class="flex flex-col gap-3" @submit.prevent="handleSubmit">
            <label for="libpod-resource"
                class="font-mono text-[11px] uppercase tracking-widest text-neutral-400 dark:text-neutral-600">
                Resource
            </label>

            <div class="gap-2 sm:flex-row">
                <div
                    class="flex min-w-0 flex-1 items-center border-b border-neutral-200 text-sm text-neutral-900 focus-within:border-neutral-900 dark:border-neutral-800 dark:text-white dark:focus-within:border-white">
                    <span class="shrink-0 py-2 text-neutral-400 dark:text-neutral-600">libpod/</span>
                    <input id="libpod-resource" v-model="resource" type="text" autocomplete="off"
                        placeholder="containers/json"
                        class="min-w-0 flex-1 border-0 bg-transparent py-2 pl-0.5 outline-none placeholder:text-neutral-400 dark:placeholder:text-neutral-600">
                </div>

                <div class="mt-4">
                    <button type="submit" :disabled="isLoading"
                        class="inline-flex cursor-pointer items-center justify-center border border-neutral-900 bg-neutral-900 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200">
                        {{ isLoading ? 'Loading...' : 'GET' }}
                    </button>
                </div>
            </div>

            <p v-if="errorMessage" class="text-sm text-red-500 dark:text-red-400">
                {{ errorMessage }}
            </p>
        </form>

        <div class="flex flex-col gap-3">
            <h2 class="font-mono text-[11px] uppercase tracking-widest text-neutral-400 dark:text-neutral-600">
                Response body
            </h2>
            <pre
                class="min-h-40 overflow-x-auto border border-neutral-200 bg-neutral-50 p-4 text-xs leading-relaxed whitespace-pre-wrap wrap-break-word text-neutral-700 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300">{{ formattedResult }}</pre>
        </div>
    </div>
</template>
