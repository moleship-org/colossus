<script setup lang="ts">
import { ArrowLeft, Pencil, Play, RefreshCw, Square, Trash2 } from '@lucide/vue'
import { getErrorMessage } from '~/composables/errors'

definePageMeta({
  layout: 'default',
  middleware: ['auth']
})

interface ContainerStatus {
  name: string
  status: string
  kind: string
}

const route = useRoute()
const router = useRouter()
const containers = useQuadletContainers()

const name = computed(() => String(route.params.name || ''))
const containerFile = ref('')
const status = ref<ContainerStatus | null>(null)
const errorMessage = ref('')
const isLoading = ref(true)
const activeOperation = ref('')

useHead(() => ({
  title: name.value ? `${name.value} container` : 'Container'
}))

const statusTone = computed(() => {
  const normalized = status.value?.status?.toLowerCase() ?? ''

  if (normalized?.includes('inactive')) {
    return 'border-neutral-200 bg-neutral-50 text-neutral-600 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300'
  }

  if (normalized?.includes('active') || normalized?.includes('running')) {
    return 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300'
  }
  if (normalized.includes('failed') || normalized.includes('dead')) {
    return 'border-red-200 bg-red-50 text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300'
  }
  return 'border-neutral-200 bg-neutral-50 text-neutral-700 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300'
})

async function loadContainer() {
  if (!name.value) {
    errorMessage.value = 'Missing container name.'
    isLoading.value = false
    return
  }

  isLoading.value = true
  errorMessage.value = ''

  try {
    const [fileContent, containerStatus] = await Promise.all([
      containers.read(name.value),
      containers.status(name.value)
    ])

    containerFile.value = fileContent
    status.value = JSON.parse(containerStatus)
  } catch (err) {
    errorMessage.value = getErrorMessage(err)
  } finally {
    isLoading.value = false
  }
}

async function runOperation(operation: 'start' | 'stop' | 'restart' | 'delete') {
  activeOperation.value = operation
  errorMessage.value = ''

  try {
    if (operation === 'start') {
      await containers.start(name.value)
    } else if (operation === 'stop') {
      await containers.stop(name.value)
    } else if (operation === 'restart') {
      await containers.restart(name.value)
    } else {
      await containers.remove(name.value)
      await navigateTo('/ship/containers')
      return
    }

    await loadContainer()
  } catch (err) {
    errorMessage.value = getErrorMessage(err)
  } finally {
    activeOperation.value = ''
  }
}

await loadContainer()
</script>

<template>
  <div
    <div class="flex flex-col gap-4 border border-neutral-200 bg-white/95 p-4 shadow-2xl shadow-neutral-200/40 backdrop-blur-xl dark:border-neutral-800 dark:bg-neutral-950/95 dark:shadow-black/20 md:gap-6 md:p-6">
    <div class="flex flex-wrap items-start justify-between gap-4">
      <div>
        <h2 class="mt-2 text-2xl font-medium text-neutral-900 dark:text-white">
          {{ name }}
        </h2>
      </div>

      <button
        type="button"
        class="inline-flex cursor-pointer items-center gap-2 text-sm text-neutral-500 transition-colors hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
        @click="router.back()">
        <ArrowLeft class="size-4" />
        Back
      </button>
    </div>

    <div
      v-if="errorMessage"
      class="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300"
    >
      {{ errorMessage }}
    </div>

    <template v-else>
      <div class="flex flex-col gap-3 md:flex-row md:flex-wrap md:items-center md:justify-between md:gap-4">
        <div class="inline-flex items-center gap-3 border px-4 py-2 text-sm" :class="statusTone">
          <span class="size-2 bg-current" />
          <span>{{ isLoading ? 'Loading status…' : status?.status || 'Unknown status' }}</span>
        </div>

        <div class="grid grid-cols-2 gap-2 md:flex md:flex-wrap">
          <button
            type="button"
            :disabled="Boolean(activeOperation) || isLoading"
            class="inline-flex cursor-pointer items-center gap-2 border border-neutral-200 px-4 py-2 text-sm text-neutral-700 transition-colors hover:border-neutral-900 hover:text-neutral-900 disabled:cursor-not-allowed disabled:opacity-60 dark:border-neutral-800 dark:text-neutral-300 dark:hover:border-white dark:hover:text-white"
            @click="runOperation('start')"
          >
            <Play class="size-4" />
            {{ activeOperation === 'start' ? 'Starting...' : 'Start' }}
          </button>
          <button
            type="button"
            :disabled="Boolean(activeOperation) || isLoading"
            class="inline-flex cursor-pointer items-center gap-2 border border-neutral-200 px-4 py-2 text-sm text-neutral-700 transition-colors hover:border-neutral-900 hover:text-neutral-900 disabled:cursor-not-allowed disabled:opacity-60 dark:border-neutral-800 dark:text-neutral-300 dark:hover:border-white dark:hover:text-white"
            @click="runOperation('stop')"
          >
            <Square class="size-4" />
            {{ activeOperation === 'stop' ? 'Stopping...' : 'Stop' }}
          </button>
          <button
            type="button"
            :disabled="Boolean(activeOperation) || isLoading"
            class="inline-flex cursor-pointer items-center gap-2 border border-neutral-200 px-4 py-2 text-sm text-neutral-700 transition-colors hover:border-neutral-900 hover:text-neutral-900 disabled:cursor-not-allowed disabled:opacity-60 dark:border-neutral-800 dark:text-neutral-300 dark:hover:border-white dark:hover:text-white"
            @click="runOperation('restart')"
          >
            <RefreshCw class="size-4" />
            {{ activeOperation === 'restart' ? 'Restarting...' : 'Restart' }}
          </button>
          <button
            type="button"
            :disabled="Boolean(activeOperation) || isLoading"
            class="inline-flex cursor-pointer items-center gap-2 border border-red-200 px-4 py-2 text-sm text-red-700 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-red-900/60 dark:text-red-300 dark:hover:bg-red-950/40"
            @click="runOperation('delete')"
          >
            <Trash2 class="size-4" />
            {{ activeOperation === 'delete' ? 'Deleting...' : 'Delete' }}
          </button>
        </div>
      </div>

      <div class="grid gap-3 md:gap-4 lg:grid-cols-1">
        <section
          class="border border-neutral-200 bg-neutral-50/80 p-5 dark:border-neutral-800 dark:bg-neutral-900/60"
        >
          <div class="flex flex-wrap items-center justify-start gap-3">
            <NuxtLink
              :to="`/ship/containers/edit/${encodeURIComponent(name)}`"
              class="inline-flex items-center gap-2 border border-neutral-900 bg-neutral-900 px-4 py-2 text-sm font-medium text-white! transition-colors hover:bg-neutral-700 dark:border-white dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
            >
              <Pencil class="size-4 inline" />
              Edit
            </NuxtLink>
          </div>
        </section>

        <section
          class="border border-neutral-200 bg-neutral-50/80 p-5 dark:border-neutral-800 dark:bg-neutral-900/60"
        >
          <h3
            class="font-mono text-[11px] uppercase tracking-widest text-neutral-400 dark:text-neutral-600"
          >
            Overview
          </h3>

          <dl class="mt-4 grid gap-4 text-sm md:grid-cols-2">
            <div>
              <dt class="text-neutral-400 dark:text-neutral-600">Name</dt>
              <dd class="mt-1 font-medium text-neutral-900 dark:text-white">{{ name }}</dd>
            </div>
            <div>
              <dt class="text-neutral-400 dark:text-neutral-600">Kind</dt>
              <dd class="mt-1 font-medium text-neutral-900 dark:text-white">Container</dd>
            </div>
            <div class="md:col-span-2">
              <dt class="text-neutral-400 dark:text-neutral-600">Status</dt>
              <dd class="mt-1 whitespace-pre-wrap text-neutral-700 dark:text-neutral-300">
                {{ status?.status || 'Unknown' }}
              </dd>
            </div>
          </dl>
        </section>

        <section
          class="border border-neutral-200 bg-neutral-50/80 p-5 dark:border-neutral-800 dark:bg-neutral-900/60"
        >
          <h3
            class="font-mono text-[11px] uppercase tracking-widest text-neutral-400 dark:text-neutral-600"
          >
            Unit file
          </h3>
          <pre
            class="mt-2 max-h-112 overflow-auto whitespace-pre-wrap wrap-break-word bg-white p-4 font-mono text-xs leading-relaxed text-neutral-700 dark:bg-neutral-950 dark:text-neutral-300"
            >{{ isLoading ? 'Loading…' : containerFile }}</pre>
        </section>
      </div>
    </template>
  </div>
</template>
