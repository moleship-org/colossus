<script setup lang="ts">
import { LucideImage, Plus, RefreshCw } from '@lucide/vue'
import type { QuadletUnitInfo } from '~/composables/useQuadlet'

definePageMeta({
  layout: 'default',
  middleware: ['auth'],
})

useHead({
  title: 'Images',
})

const route = useRoute()
const imagesApi = useQuadletImages()

const images = ref<QuadletUnitInfo[]>([])
const errorMessage = ref('')
const isLoading = ref(true)
const isRefreshing = ref(false)

const selectedImageName = computed(() => {
  const param = route.params.name
  return typeof param === 'string' ? param : ''
})

const hasOverlayView = computed(() => route.path !== '/ship/images')

const sortedImages = computed(() => {
  return [...images.value].sort((a, b) => a.name.localeCompare(b.name))
})

const statusLabel = getQuadletStatusLabel
const statusClass = (item: QuadletUnitInfo) => getQuadletStatusToneClass(statusLabel(item))

async function loadImages(mode: 'initial' | 'refresh' = 'initial') {
  if (mode === 'initial') {
    isLoading.value = true
  } else {
    isRefreshing.value = true
  }

  errorMessage.value = ''

  try {
    images.value = await imagesApi.list()
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
    void loadImages('refresh')
  },
  { immediate: true },
)
</script>

<template>
  <div class="relative flex flex-col gap-4 p-3 md:gap-6 md:p-6">
    <div class="flex flex-col gap-3 md:flex-row md:flex-wrap md:items-start md:justify-between md:gap-4">
      <div>
        <h1 class="mt-2 text-2xl font-medium text-neutral-900 dark:text-white">
          Images
        </h1>
        <p class="mt-2 max-w-2xl text-sm text-neutral-500 dark:text-neutral-400">
          Control and manage your quadlet image units.
        </p>
      </div>

      <div class="grid grid-cols-2 gap-2 md:flex md:flex-wrap">
        <button
          type="button"
          :disabled="isLoading || isRefreshing"
          class="btn-outline font-medium"
          @click="loadImages('refresh')"
        >
          <RefreshCw class="size-4" :class="isRefreshing ? 'animate-spin' : ''" />
          {{ isRefreshing ? 'Refreshing...' : 'Refresh' }}
        </button>

        <NuxtLink
          to="/ship/images/new"
          class="btn-fill"
        >
          <Plus class="size-4 inline" />
          New image
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
            {{ sortedImages.length }} image{{ sortedImages.length === 1 ? '' : 's' }} found
          </p>
        </div>
      </div>

      <div v-if="isLoading" class="flex min-h-40 items-center justify-center text-sm text-neutral-500 dark:text-neutral-400 md:min-h-64">
        Loading images…
      </div>

      <div v-else-if="!sortedImages.length" class="mt-3 flex min-h-40 flex-col items-center justify-center gap-3 border border-dashed border-neutral-200 bg-neutral-50/60 p-6 text-center dark:border-neutral-800 dark:bg-neutral-900/40 md:mt-4 md:min-h-64 md:p-8">
        <LucideImage class="size-10 text-neutral-300 dark:text-neutral-700" />
        <div>
          <p class="text-sm font-medium text-neutral-900 dark:text-white">
            No images yet
          </p>
          <p class="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            Create your first quadlet image unit to get started.
          </p>
        </div>
      </div>

      <div v-else class="mt-3 flex flex-col gap-2 md:mt-4 md:gap-3">
        <NuxtLink
          v-for="item in sortedImages"
          :key="item.name"
          :to="`/ship/images/${encodeURIComponent(item.name)}`"
          class="group border p-3 transition-all hover:border-neutral-300 hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900/40 dark:hover:border-neutral-700 dark:hover:bg-neutral-900 md:p-4"
          :class="selectedImageName === item.name ? 'border-neutral-900 bg-neutral-50 dark:border-white dark:bg-neutral-900' : 'border-neutral-200 bg-white'"
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
