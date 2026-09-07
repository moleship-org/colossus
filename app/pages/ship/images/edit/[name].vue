<script setup lang="ts">
import { ArrowLeft, Save } from '@lucide/vue'
import type { QuadletImageUnit } from '~/composables/use-quadlet'
import {
  buildQuadletImagePayload,
  createEmptyQuadletImageRaw,
  createEmptyQuadletImageUnit,
  parseImageUnitFile,
} from '~/composables/quadlet-image-form'
import { getErrorMessage } from '~/composables/errors'

definePageMeta({
  layout: 'default',
  middleware: ['auth'],
})

const route = useRoute()
const router = useRouter()
const images = useQuadletImages()

const originalName = computed(() => String(route.params.name || ''))
const form = reactive<QuadletImageUnit>(createEmptyQuadletImageUnit())
const raw = reactive(createEmptyQuadletImageRaw())
const startAfterSave = ref(false)
const isLoading = ref(true)
const isSubmitting = ref(false)
const errorMessage = ref('')

useHead(() => ({
  title: originalName.value ? `Edit ${originalName.value}` : 'Edit image',
}))

async function loadDefaults() {
  if (!originalName.value) {
    errorMessage.value = 'Missing image name.'
    isLoading.value = false
    return
  }

  isLoading.value = true
  errorMessage.value = ''

  try {
    const content = await images.read(originalName.value)
    const parsed = parseImageUnitFile(content, originalName.value)

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
    const payload = buildQuadletImagePayload(form, raw)
    const renamed = payload.name !== originalName.value

    await images.remove(originalName.value)
    await images.create(payload, {
      start: startAfterSave.value,
      failIfExists: renamed,
    })

    await navigateTo(`/ship/images/${encodeURIComponent(payload.name)}`)
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
      Loading image defaults…
    </div>

    <form v-else class="flex flex-col gap-8" @submit.prevent="handleSubmit">
      <div class="grid gap-4 md:grid-cols-2">
        <label class="flex flex-col gap-2 text-sm">
          <span class="font-mono text-[11px] uppercase tracking-widest text-neutral-400 dark:text-neutral-600">Name</span>
          <input v-model="form.name" type="text" class="border border-neutral-200 bg-transparent px-3 py-2 text-neutral-900 outline-none focus:border-neutral-900 dark:border-neutral-800 dark:text-white dark:focus:border-white">
        </label>

        <label class="flex flex-col gap-2 text-sm">
          <span class="font-mono text-[11px] uppercase tracking-widest text-neutral-400 dark:text-neutral-600">Image</span>
          <input v-model="form.image" type="text" class="border border-neutral-200 bg-transparent px-3 py-2 text-neutral-900 outline-none focus:border-neutral-900 dark:border-neutral-800 dark:text-white dark:focus:border-white">
        </label>

        <label class="flex flex-col gap-2 text-sm md:col-span-2">
          <span class="font-mono text-[11px] uppercase tracking-widest text-neutral-400 dark:text-neutral-600">Description</span>
          <input v-model="form.description" type="text" class="border border-neutral-200 bg-transparent px-3 py-2 text-neutral-900 outline-none focus:border-neutral-900 dark:border-neutral-800 dark:text-white dark:focus:border-white">
        </label>

        <label class="flex flex-col gap-2 text-sm">
          <span class="font-mono text-[11px] uppercase tracking-widest text-neutral-400 dark:text-neutral-600">Image tag</span>
          <input v-model="form.image_tag" type="text" class="border border-neutral-200 bg-transparent px-3 py-2 text-neutral-900 outline-none focus:border-neutral-900 dark:border-neutral-800 dark:text-white dark:focus:border-white">
        </label>

        <label class="flex flex-col gap-2 text-sm">
          <span class="font-mono text-[11px] uppercase tracking-widest text-neutral-400 dark:text-neutral-600">Architecture</span>
          <input v-model="form.arch" type="text" class="border border-neutral-200 bg-transparent px-3 py-2 text-neutral-900 outline-none focus:border-neutral-900 dark:border-neutral-800 dark:text-white dark:focus:border-white">
        </label>

        <label class="flex flex-col gap-2 text-sm">
          <span class="font-mono text-[11px] uppercase tracking-widest text-neutral-400 dark:text-neutral-600">Variant</span>
          <input v-model="form.variant" type="text" class="border border-neutral-200 bg-transparent px-3 py-2 text-neutral-900 outline-none focus:border-neutral-900 dark:border-neutral-800 dark:text-white dark:focus:border-white">
        </label>

        <label class="flex flex-col gap-2 text-sm">
          <span class="font-mono text-[11px] uppercase tracking-widest text-neutral-400 dark:text-neutral-600">OS</span>
          <input v-model="form.os" type="text" class="border border-neutral-200 bg-transparent px-3 py-2 text-neutral-900 outline-none focus:border-neutral-900 dark:border-neutral-800 dark:text-white dark:focus:border-white">
        </label>

        <label class="flex flex-col gap-2 text-sm">
          <span class="font-mono text-[11px] uppercase tracking-widest text-neutral-400 dark:text-neutral-600">Policy</span>
          <input v-model="form.policy" type="text" class="border border-neutral-200 bg-transparent px-3 py-2 text-neutral-900 outline-none focus:border-neutral-900 dark:border-neutral-800 dark:text-white dark:focus:border-white">
        </label>

        <label class="flex flex-col gap-2 text-sm">
          <span class="font-mono text-[11px] uppercase tracking-widest text-neutral-400 dark:text-neutral-600">Retry</span>
          <input v-model.number="form.retry" type="number" min="0" class="border border-neutral-200 bg-transparent px-3 py-2 text-neutral-900 outline-none focus:border-neutral-900 dark:border-neutral-800 dark:text-white dark:focus:border-white">
        </label>

        <label class="flex flex-col gap-2 text-sm">
          <span class="font-mono text-[11px] uppercase tracking-widest text-neutral-400 dark:text-neutral-600">Retry delay</span>
          <input v-model="form.retry_delay" type="text" class="border border-neutral-200 bg-transparent px-3 py-2 text-neutral-900 outline-none focus:border-neutral-900 dark:border-neutral-800 dark:text-white dark:focus:border-white">
        </label>

        <label class="flex flex-col gap-2 text-sm">
          <span class="font-mono text-[11px] uppercase tracking-widest text-neutral-400 dark:text-neutral-600">Credentials</span>
          <input v-model="form.creds" type="text" class="border border-neutral-200 bg-transparent px-3 py-2 text-neutral-900 outline-none focus:border-neutral-900 dark:border-neutral-800 dark:text-white dark:focus:border-white">
        </label>

        <label class="flex flex-col gap-2 text-sm">
          <span class="font-mono text-[11px] uppercase tracking-widest text-neutral-400 dark:text-neutral-600">Auth file</span>
          <input v-model="form.auth_file" type="text" class="border border-neutral-200 bg-transparent px-3 py-2 text-neutral-900 outline-none focus:border-neutral-900 dark:border-neutral-800 dark:text-white dark:focus:border-white">
        </label>

        <label class="flex flex-col gap-2 text-sm">
          <span class="font-mono text-[11px] uppercase tracking-widest text-neutral-400 dark:text-neutral-600">Cert directory</span>
          <input v-model="form.cert_dir" type="text" class="border border-neutral-200 bg-transparent px-3 py-2 text-neutral-900 outline-none focus:border-neutral-900 dark:border-neutral-800 dark:text-white dark:focus:border-white">
        </label>

        <label class="flex flex-col gap-2 text-sm">
          <span class="font-mono text-[11px] uppercase tracking-widest text-neutral-400 dark:text-neutral-600">Decryption key</span>
          <input v-model="form.decryption_key" type="text" class="border border-neutral-200 bg-transparent px-3 py-2 text-neutral-900 outline-none focus:border-neutral-900 dark:border-neutral-800 dark:text-white dark:focus:border-white">
        </label>
      </div>

      <div class="grid gap-4 md:grid-cols-2">
        <label class="flex flex-col gap-2 text-sm">
          <span class="font-mono text-[11px] uppercase tracking-widest text-neutral-400 dark:text-neutral-600">Containers conf modules</span>
          <textarea v-model="raw.containers_conf_modules" rows="4" class="border border-neutral-200 bg-transparent p-3 font-mono text-sm text-neutral-900 outline-none focus:border-neutral-900 dark:border-neutral-800 dark:text-white dark:focus:border-white"></textarea>
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

      <div class="flex flex-wrap gap-6 text-sm text-neutral-600 dark:text-neutral-300">
        <label class="inline-flex items-center gap-2">
          <input v-model="form.all_tags" type="checkbox" class="size-4">
          All tags
        </label>

        <label class="inline-flex items-center gap-2">
          <input v-model="form.tls_verify" type="checkbox" class="size-4">
          TLS verify
        </label>

        <label class="inline-flex items-center gap-2">
          <input v-model="startAfterSave" type="checkbox" class="size-4">
          Start after save
        </label>
      </div>

      <div class="flex flex-wrap gap-3 border-t border-neutral-200 pt-6 dark:border-neutral-800">
        <button type="submit" :disabled="isSubmitting" class="btn-fill min-w-36 px-5">
          <Save class="size-4" />
          {{ isSubmitting ? 'Saving...' : 'Save changes' }}
        </button>
      </div>
    </form>
  </div>
</template>
