<script setup lang="ts">
import { ArrowLeft, Save } from '@lucide/vue'
import type { QuadletVolumeUnit } from '~/composables/use-quadlet'
import {
  buildQuadletVolumePayload,
  createEmptyQuadletVolumeRaw,
  createEmptyQuadletVolumeUnit,
  parseVolumeUnitFile,
} from '~/composables/quadlet-volume-form'
import { getErrorMessage } from '~/composables/errors'

definePageMeta({
  layout: 'default',
  middleware: ['auth'],
})

const route = useRoute()
const router = useRouter()
const volumes = useQuadletVolumes()

const originalName = computed(() => String(route.params.name || ''))
const form = reactive<QuadletVolumeUnit>(createEmptyQuadletVolumeUnit())
const raw = reactive(createEmptyQuadletVolumeRaw())
const startAfterSave = ref(false)
const isLoading = ref(true)
const isSubmitting = ref(false)
const errorMessage = ref('')

useHead(() => ({
  title: originalName.value ? `Edit ${originalName.value}` : 'Edit volume',
}))

async function loadDefaults() {
  if (!originalName.value) {
    errorMessage.value = 'Missing volume name.'
    isLoading.value = false
    return
  }

  isLoading.value = true
  errorMessage.value = ''

  try {
    const content = await volumes.read(originalName.value)
    const parsed = parseVolumeUnitFile(content, originalName.value)

    Object.assign(form, parsed.form)
    Object.assign(raw, parsed.raw)
  } catch (err) {
    errorMessage.value = getErrorMessage(err)
  } finally {
    isLoading.value = false
  }
}

async function handleSubmit() {
  errorMessage.value = ''
  isSubmitting.value = true

  try {
    const payload = buildQuadletVolumePayload(form, raw)
    const renamed = payload.name !== originalName.value

    await volumes.remove(originalName.value)
    await volumes.create(payload, {
      start: startAfterSave.value,
      failIfExists: renamed,
    })

    await navigateTo(`/ship/volumes/${encodeURIComponent(payload.name)}`)
  } catch (err) {
    errorMessage.value = err instanceof Error ? err.message : getErrorMessage(err)
  } finally {
    isSubmitting.value = false
  }
}

await loadDefaults()
</script>

<template>
  <div class="flex flex-col gap-6 border border-neutral-200 bg-white/95 p-6 shadow-2xl shadow-neutral-200/40 backdrop-blur-xl dark:border-neutral-800 dark:bg-neutral-950/95 dark:shadow-black/20">
    <div class="flex flex-wrap items-start justify-between gap-4">
      <div>
        <h2 class="mt-2 text-2xl font-medium text-neutral-900 dark:text-white">
          Edit {{ originalName }}
        </h2>
      </div>

      <button type="button" class="btn-ghost" @click="router.back()">
        <ArrowLeft class="size-4" />
        Back
      </button>
    </div>

    <div v-if="errorMessage" class="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300">
      {{ errorMessage }}
    </div>

    <div v-if="isLoading" class="border border-neutral-200 bg-neutral-50 px-4 py-8 text-sm text-neutral-500 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400">
      Loading volume defaults…
    </div>

    <form v-else class="flex flex-col gap-8" @submit.prevent="handleSubmit">
      <div class="grid gap-4 md:grid-cols-2">
        <label class="flex flex-col gap-2 text-sm">
          <span class="font-mono text-[11px] uppercase tracking-widest text-neutral-400 dark:text-neutral-600">Name</span>
          <input v-model="form.name" type="text" class="border border-neutral-200 bg-transparent px-3 py-2 text-neutral-900 outline-none focus:border-neutral-900 dark:border-neutral-800 dark:text-white dark:focus:border-white">
        </label>

        <label class="flex flex-col gap-2 text-sm">
          <span class="font-mono text-[11px] uppercase tracking-widest text-neutral-400 dark:text-neutral-600">Volume name</span>
          <input v-model="form.volume_name" type="text" class="border border-neutral-200 bg-transparent px-3 py-2 text-neutral-900 outline-none focus:border-neutral-900 dark:border-neutral-800 dark:text-white dark:focus:border-white">
        </label>

        <label class="flex flex-col gap-2 text-sm md:col-span-2">
          <span class="font-mono text-[11px] uppercase tracking-widest text-neutral-400 dark:text-neutral-600">Description</span>
          <input v-model="form.description" type="text" class="border border-neutral-200 bg-transparent px-3 py-2 text-neutral-900 outline-none focus:border-neutral-900 dark:border-neutral-800 dark:text-white dark:focus:border-white">
        </label>

        <label class="flex flex-col gap-2 text-sm">
          <span class="font-mono text-[11px] uppercase tracking-widest text-neutral-400 dark:text-neutral-600">Driver</span>
          <input v-model="form.driver" type="text" class="border border-neutral-200 bg-transparent px-3 py-2 text-neutral-900 outline-none focus:border-neutral-900 dark:border-neutral-800 dark:text-white dark:focus:border-white">
        </label>

        <label class="flex flex-col gap-2 text-sm">
          <span class="font-mono text-[11px] uppercase tracking-widest text-neutral-400 dark:text-neutral-600">Device</span>
          <input v-model="form.device" type="text" class="border border-neutral-200 bg-transparent px-3 py-2 text-neutral-900 outline-none focus:border-neutral-900 dark:border-neutral-800 dark:text-white dark:focus:border-white">
        </label>

        <label class="flex flex-col gap-2 text-sm">
          <span class="font-mono text-[11px] uppercase tracking-widest text-neutral-400 dark:text-neutral-600">Type</span>
          <input v-model="form.type" type="text" class="border border-neutral-200 bg-transparent px-3 py-2 text-neutral-900 outline-none focus:border-neutral-900 dark:border-neutral-800 dark:text-white dark:focus:border-white">
        </label>

        <label class="flex flex-col gap-2 text-sm">
          <span class="font-mono text-[11px] uppercase tracking-widest text-neutral-400 dark:text-neutral-600">Image</span>
          <input v-model="form.image" type="text" class="border border-neutral-200 bg-transparent px-3 py-2 text-neutral-900 outline-none focus:border-neutral-900 dark:border-neutral-800 dark:text-white dark:focus:border-white">
        </label>

        <label class="flex flex-col gap-2 text-sm">
          <span class="font-mono text-[11px] uppercase tracking-widest text-neutral-400 dark:text-neutral-600">User</span>
          <input v-model="form.user" type="text" class="border border-neutral-200 bg-transparent px-3 py-2 text-neutral-900 outline-none focus:border-neutral-900 dark:border-neutral-800 dark:text-white dark:focus:border-white">
        </label>

        <label class="flex flex-col gap-2 text-sm">
          <span class="font-mono text-[11px] uppercase tracking-widest text-neutral-400 dark:text-neutral-600">Group</span>
          <input v-model="form.group" type="text" class="border border-neutral-200 bg-transparent px-3 py-2 text-neutral-900 outline-none focus:border-neutral-900 dark:border-neutral-800 dark:text-white dark:focus:border-white">
        </label>
      </div>

      <div class="grid gap-4 md:grid-cols-2">
        <label class="flex flex-col gap-2 text-sm">
          <span class="font-mono text-[11px] uppercase tracking-widest text-neutral-400 dark:text-neutral-600">Containers conf modules</span>
          <textarea v-model="raw.containers_conf_modules" rows="4" class="border border-neutral-200 bg-transparent p-3 font-mono text-sm text-neutral-900 outline-none focus:border-neutral-900 dark:border-neutral-800 dark:text-white dark:focus:border-white"></textarea>
        </label>

        <label class="flex flex-col gap-2 text-sm">
          <span class="font-mono text-[11px] uppercase tracking-widest text-neutral-400 dark:text-neutral-600">Options</span>
          <textarea v-model="raw.options" rows="4" class="border border-neutral-200 bg-transparent p-3 font-mono text-sm text-neutral-900 outline-none focus:border-neutral-900 dark:border-neutral-800 dark:text-white dark:focus:border-white"></textarea>
        </label>

        <label class="flex flex-col gap-2 text-sm">
          <span class="font-mono text-[11px] uppercase tracking-widest text-neutral-400 dark:text-neutral-600">Global arguments</span>
          <textarea v-model="raw.global_args" rows="4" class="border border-neutral-200 bg-transparent p-3 font-mono text-sm text-neutral-900 outline-none focus:border-neutral-900 dark:border-neutral-800 dark:text-white dark:focus:border-white"></textarea>
        </label>

        <label class="flex flex-col gap-2 text-sm">
          <span class="font-mono text-[11px] uppercase tracking-widest text-neutral-400 dark:text-neutral-600">Podman arguments</span>
          <textarea v-model="raw.podman_args" rows="4" class="border border-neutral-200 bg-transparent p-3 font-mono text-sm text-neutral-900 outline-none focus:border-neutral-900 dark:border-neutral-800 dark:text-white dark:focus:border-white"></textarea>
        </label>

        <label class="flex flex-col gap-2 text-sm">
          <span class="font-mono text-[11px] uppercase tracking-widest text-neutral-400 dark:text-neutral-600">Labels</span>
          <textarea v-model="raw.labels" rows="6" class="border border-neutral-200 bg-transparent p-3 font-mono text-sm text-neutral-900 outline-none focus:border-neutral-900 dark:border-neutral-800 dark:text-white dark:focus:border-white"></textarea>
        </label>

        <label class="flex flex-col gap-2 text-sm">
          <span class="font-mono text-[11px] uppercase tracking-widest text-neutral-400 dark:text-neutral-600">After</span>
          <textarea v-model="raw.after" rows="4" class="border border-neutral-200 bg-transparent p-3 font-mono text-sm text-neutral-900 outline-none focus:border-neutral-900 dark:border-neutral-800 dark:text-white dark:focus:border-white"></textarea>
        </label>

        <label class="flex flex-col gap-2 text-sm">
          <span class="font-mono text-[11px] uppercase tracking-widest text-neutral-400 dark:text-neutral-600">Requires</span>
          <textarea v-model="raw.requires" rows="4" class="border border-neutral-200 bg-transparent p-3 font-mono text-sm text-neutral-900 outline-none focus:border-neutral-900 dark:border-neutral-800 dark:text-white dark:focus:border-white"></textarea>
        </label>

        <label class="flex flex-col gap-2 text-sm md:col-span-2">
          <span class="font-mono text-[11px] uppercase tracking-widest text-neutral-400 dark:text-neutral-600">Wanted by</span>
          <textarea v-model="raw.wanted_by" rows="3" class="border border-neutral-200 bg-transparent p-3 font-mono text-sm text-neutral-900 outline-none focus:border-neutral-900 dark:border-neutral-800 dark:text-white dark:focus:border-white"></textarea>
        </label>
      </div>

      <label class="inline-flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-300">
        <input v-model="form.copy" type="checkbox" class="size-4">
        Copy
      </label>

      <label class="inline-flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-300">
        <input v-model="startAfterSave" type="checkbox" class="size-4">
        Start after save
      </label>

      <div class="flex flex-wrap gap-3 border-t border-neutral-200 pt-6 dark:border-neutral-800">
        <button type="submit" :disabled="isSubmitting" class="btn-fill min-w-36 px-5">
          <Save class="size-4" />
          {{ isSubmitting ? 'Saving...' : 'Save changes' }}
        </button>
      </div>
    </form>
  </div>
</template>
