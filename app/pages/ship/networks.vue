<script setup lang="ts">
import { LucideNetwork, Plus, RefreshCw } from '@lucide/vue'
import type { QuadletUnitInfo } from '~/composables/useQuadlet'

definePageMeta({
  layout: 'default',
  middleware: ['auth'],
})

useHead({
  title: 'Networks',
})

const route = useRoute()
const networksApi = useQuadletNetworks()

const networks = ref<QuadletUnitInfo[]>([])
const errorMessage = ref('')
const isLoading = ref(true)
const isRefreshing = ref(false)

const selectedNetworkName = computed(() => {
  const param = route.params.name
  return typeof param === 'string' ? param : ''
})

const hasOverlayView = computed(() => route.path !== '/ship/networks')

const sortedNetworks = computed(() => {
  return [...networks.value].sort((a, b) => a.name.localeCompare(b.name))
})

function statusLabel(item: QuadletUnitInfo) {
  if (item.statusError) {
    return 'Status unavailable'
  }

  return item.status || 'Unknown'
}

function statusClass(item: QuadletUnitInfo) {
  const label = statusLabel(item).toLowerCase()

  if (label.includes('inactive')) {
    return 'border-neutral-200 bg-neutral-50 text-neutral-600 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300'
  }

  if (label.includes('active') || label.includes('running')) {
    return 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300'
  }

  if (label.includes('failed') || label.includes('dead')) {
    return 'border-red-200 bg-red-50 text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300'
  }

  return 'border-neutral-200 bg-neutral-50 text-neutral-600 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300'
}

async function loadNetworks(mode: 'initial' | 'refresh' = 'initial') {
  if (mode === 'initial') {
    isLoading.value = true
  } else {
    isRefreshing.value = true
  }

  errorMessage.value = ''

  try {
    networks.value = await networksApi.list()
  } catch (err) {
    errorMessage.value = getErrorMessage(err)
  } finally {
    isLoading.value = false
    isRefreshing.value = false
  }
}

watch(
  () => route.fullPath,
  () => {
    void loadNetworks('refresh')
  },
  { immediate: true },
)
</script>

<template>
  <div class="relative flex flex-col gap-4 p-3 md:gap-6 md:p-6">
    <div class="flex flex-col gap-3 md:flex-row md:flex-wrap md:items-start md:justify-between md:gap-4">
      <div>
        <h1 class="mt-2 text-2xl font-medium text-neutral-900 dark:text-white">
          Networks
        </h1>
        <p class="mt-2 max-w-2xl text-sm text-neutral-500 dark:text-neutral-400">
          Control and manage your quadlet network units.
        </p>
      </div>

      <div class="grid grid-cols-2 gap-2 md:flex md:flex-wrap">
        <button
          type="button"
          :disabled="isLoading || isRefreshing"
          class="btn-outline font-medium"
          @click="loadNetworks('refresh')"
        >
          <RefreshCw class="size-4" :class="isRefreshing ? 'animate-spin' : ''" />
          {{ isRefreshing ? 'Refreshing...' : 'Refresh' }}
        </button>

        <NuxtLink
          to="/ship/networks/new"
          class="btn-fill"
        >
          <Plus class="size-4 inline" />
          New network
        </NuxtLink>
      </div>
    </div>

    <div v-if="errorMessage" class="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300">
      {{ errorMessage }}
    </div>

    <section class="border border-neutral-200 bg-white/80 p-3 backdrop-blur-sm dark:border-neutral-800 dark:bg-neutral-950/60 md:p-4">
      <div class="flex items-center justify-between gap-3 border-b border-neutral-200 px-2 pb-4 dark:border-neutral-800">
        <div>
          <p class="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            {{ sortedNetworks.length }} network{{ sortedNetworks.length === 1 ? '' : 's' }} found
          </p>
        </div>
      </div>

      <div v-if="isLoading" class="flex min-h-40 items-center justify-center text-sm text-neutral-500 dark:text-neutral-400 md:min-h-64">
        Loading networks…
      </div>

      <div v-else-if="!sortedNetworks.length" class="mt-3 flex min-h-40 flex-col items-center justify-center gap-3 border border-dashed border-neutral-200 bg-neutral-50/60 p-6 text-center dark:border-neutral-800 dark:bg-neutral-900/40 md:mt-4 md:min-h-64 md:p-8">
        <LucideNetwork class="size-10 text-neutral-300 dark:text-neutral-700" />
        <div>
          <p class="text-sm font-medium text-neutral-900 dark:text-white">
            No networks yet
          </p>
          <p class="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            Create your first quadlet network unit to get started.
          </p>
        </div>
      </div>

      <div v-else class="mt-3 flex flex-col gap-2 md:mt-4 md:gap-3">
        <NuxtLink
          v-for="item in sortedNetworks"
          :key="item.name"
          :to="`/ship/networks/${encodeURIComponent(item.name)}`"
          class="group border p-3 transition-all hover:border-neutral-300 hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900/40 dark:hover:border-neutral-700 dark:hover:bg-neutral-900 md:p-4"
          :class="selectedNetworkName === item.name ? 'border-neutral-900 bg-neutral-50 dark:border-white dark:bg-neutral-900' : 'border-neutral-200 bg-white'"
        >
          <div class="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p class="text-base font-medium text-neutral-900 dark:text-white">
                {{ item.name }}
              </p>
              <p class="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                {{ item.serviceName }}
              </p>
            </div>

            <span class="inline-flex items-center gap-2 border px-3 py-1 text-xs" :class="statusClass(item)">
              <span class="size-2 bg-current" />
              {{ statusLabel(item) }}
            </span>
          </div>
        </NuxtLink>
      </div>
    </section>

    <div v-if="hasOverlayView" class="absolute inset-0 z-20 bg-neutral-100/70 p-2 backdrop-blur-sm dark:bg-neutral-950/70 md:p-6">
      <NuxtPage />
    </div>
  </div>
</template>
