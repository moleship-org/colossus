<script setup lang="ts">
import { ArrowLeft, Plus, Save } from '@lucide/vue'
import type { QuadletVolumeUnit } from '~/composables/useQuadlet'
import {
  buildQuadletVolumePayload,
  createEmptyQuadletVolumeRaw,
  createEmptyQuadletVolumeUnit,
} from '~/composables/quadlet-volume-form'

definePageMeta({
  layout: 'default',
  middleware: ['auth'],
})

useHead({
  title: 'New volume',
})

const volumes = useQuadletVolumes()
const router = useRouter()

const form = reactive<QuadletVolumeUnit>(createEmptyQuadletVolumeUnit())
const raw = reactive(createEmptyQuadletVolumeRaw())

const startAfterCreate = ref(true)
const failIfExists = ref(true)
const isSubmitting = ref(false)
const errorMessage = ref('')

async function handleSubmit() {
  errorMessage.value = ''
  isSubmitting.value = true

  try {
    const payload = buildQuadletVolumePayload(form, raw)
    await volumes.create(payload, {
      start: startAfterCreate.value,
      failIfExists: failIfExists.value,
    })
    await navigateTo(`/ship/volumes/${encodeURIComponent(payload.name)}`)
  } catch (err) {
    errorMessage.value = err instanceof Error ? err.message : getErrorMessage(err)
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="flex flex-col gap-6 border border-neutral-200 bg-white/95 p-6 shadow-2xl shadow-neutral-200/40 backdrop-blur-xl dark:border-neutral-800 dark:bg-neutral-950/95 dark:shadow-black/20">
    <div class="flex flex-wrap items-start justify-between gap-4">
      <div>
        <p class="font-mono text-[11px] uppercase tracking-widest text-neutral-400 dark:text-neutral-600">
          /ship/volumes/new
        </p>
        <h2 class="mt-2 text-2xl font-medium text-neutral-900 dark:text-white">
          Create volume
        </h2>
      </div>

      <button type="button" class="btn-ghost" @click="router.back()">
        <ArrowLeft class="size-4" />
        Back
      </button>
    </div>

    <form class="flex flex-col gap-8" @submit.prevent="handleSubmit">
      <div class="grid gap-4 md:grid-cols-2">
        <label class="flex flex-col gap-2 text-sm">
          <span class="font-mono text-[11px] uppercase tracking-widest text-neutral-400 dark:text-neutral-600">Name</span>
          <input v-model="form.name" type="text" placeholder="postgres-data" class="border border-neutral-200 bg-transparent px-3 py-2 text-neutral-900 outline-none focus:border-neutral-900 dark:border-neutral-800 dark:text-white dark:focus:border-white">
        </label>

        <label class="flex flex-col gap-2 text-sm">
          <span class="font-mono text-[11px] uppercase tracking-widest text-neutral-400 dark:text-neutral-600">Volume name</span>
          <input v-model="form.volume_name" type="text" placeholder="postgres-data" class="border border-neutral-200 bg-transparent px-3 py-2 text-neutral-900 outline-none focus:border-neutral-900 dark:border-neutral-800 dark:text-white dark:focus:border-white">
        </label>

        <label class="flex flex-col gap-2 text-sm md:col-span-2">
          <span class="font-mono text-[11px] uppercase tracking-widest text-neutral-400 dark:text-neutral-600">Description</span>
          <input v-model="form.description" type="text" placeholder="Persistent database storage" class="border border-neutral-200 bg-transparent px-3 py-2 text-neutral-900 outline-none focus:border-neutral-900 dark:border-neutral-800 dark:text-white dark:focus:border-white">
        </label>

        <label class="flex flex-col gap-2 text-sm">
          <span class="font-mono text-[11px] uppercase tracking-widest text-neutral-400 dark:text-neutral-600">Driver</span>
          <input v-model="form.driver" type="text" placeholder="local" class="border border-neutral-200 bg-transparent px-3 py-2 text-neutral-900 outline-none focus:border-neutral-900 dark:border-neutral-800 dark:text-white dark:focus:border-white">
        </label>

        <label class="flex flex-col gap-2 text-sm">
          <span class="font-mono text-[11px] uppercase tracking-widest text-neutral-400 dark:text-neutral-600">Device</span>
          <input v-model="form.device" type="text" placeholder="tmpfs" class="border border-neutral-200 bg-transparent px-3 py-2 text-neutral-900 outline-none focus:border-neutral-900 dark:border-neutral-800 dark:text-white dark:focus:border-white">
        </label>

        <label class="flex flex-col gap-2 text-sm">
          <span class="font-mono text-[11px] uppercase tracking-widest text-neutral-400 dark:text-neutral-600">Type</span>
          <input v-model="form.type" type="text" placeholder="tmpfs" class="border border-neutral-200 bg-transparent px-3 py-2 text-neutral-900 outline-none focus:border-neutral-900 dark:border-neutral-800 dark:text-white dark:focus:border-white">
        </label>

        <label class="flex flex-col gap-2 text-sm">
          <span class="font-mono text-[11px] uppercase tracking-widest text-neutral-400 dark:text-neutral-600">Image</span>
          <input v-model="form.image" type="text" placeholder="docker.io/library/alpine:latest" class="border border-neutral-200 bg-transparent px-3 py-2 text-neutral-900 outline-none focus:border-neutral-900 dark:border-neutral-800 dark:text-white dark:focus:border-white">
        </label>

        <label class="flex flex-col gap-2 text-sm">
          <span class="font-mono text-[11px] uppercase tracking-widest text-neutral-400 dark:text-neutral-600">User</span>
          <input v-model="form.user" type="text" placeholder="1000" class="border border-neutral-200 bg-transparent px-3 py-2 text-neutral-900 outline-none focus:border-neutral-900 dark:border-neutral-800 dark:text-white dark:focus:border-white">
        </label>

        <label class="flex flex-col gap-2 text-sm">
          <span class="font-mono text-[11px] uppercase tracking-widest text-neutral-400 dark:text-neutral-600">Group</span>
          <input v-model="form.group" type="text" placeholder="1000" class="border border-neutral-200 bg-transparent px-3 py-2 text-neutral-900 outline-none focus:border-neutral-900 dark:border-neutral-800 dark:text-white dark:focus:border-white">
        </label>
      </div>

      <div class="grid gap-4 md:grid-cols-2">
        <label class="flex flex-col gap-2 text-sm">
          <span class="font-mono text-[11px] uppercase tracking-widest text-neutral-400 dark:text-neutral-600">Containers conf modules</span>
          <textarea v-model="raw.containers_conf_modules" rows="4" placeholder="/etc/containers/containers.conf.modules" class="border border-neutral-200 bg-transparent p-3 font-mono text-sm text-neutral-900 outline-none focus:border-neutral-900 dark:border-neutral-800 dark:text-white dark:focus:border-white"></textarea>
        </label>

        <label class="flex flex-col gap-2 text-sm">
          <span class="font-mono text-[11px] uppercase tracking-widest text-neutral-400 dark:text-neutral-600">Options</span>
          <textarea v-model="raw.options" rows="4" placeholder="o=uid=1000,gid=1000" class="border border-neutral-200 bg-transparent p-3 font-mono text-sm text-neutral-900 outline-none focus:border-neutral-900 dark:border-neutral-800 dark:text-white dark:focus:border-white"></textarea>
        </label>

        <label class="flex flex-col gap-2 text-sm">
          <span class="font-mono text-[11px] uppercase tracking-widest text-neutral-400 dark:text-neutral-600">Global arguments</span>
          <textarea v-model="raw.global_args" rows="4" placeholder="--log-level=debug" class="border border-neutral-200 bg-transparent p-3 font-mono text-sm text-neutral-900 outline-none focus:border-neutral-900 dark:border-neutral-800 dark:text-white dark:focus:border-white"></textarea>
        </label>

        <label class="flex flex-col gap-2 text-sm">
          <span class="font-mono text-[11px] uppercase tracking-widest text-neutral-400 dark:text-neutral-600">Podman arguments</span>
          <textarea v-model="raw.podman_args" rows="4" placeholder="--opt type=tmpfs" class="border border-neutral-200 bg-transparent p-3 font-mono text-sm text-neutral-900 outline-none focus:border-neutral-900 dark:border-neutral-800 dark:text-white dark:focus:border-white"></textarea>
        </label>

        <label class="flex flex-col gap-2 text-sm">
          <span class="font-mono text-[11px] uppercase tracking-widest text-neutral-400 dark:text-neutral-600">Labels</span>
          <textarea v-model="raw.labels" rows="6" placeholder="app=postgres" class="border border-neutral-200 bg-transparent p-3 font-mono text-sm text-neutral-900 outline-none focus:border-neutral-900 dark:border-neutral-800 dark:text-white dark:focus:border-white"></textarea>
        </label>

        <label class="flex flex-col gap-2 text-sm">
          <span class="font-mono text-[11px] uppercase tracking-widest text-neutral-400 dark:text-neutral-600">After</span>
          <textarea v-model="raw.after" rows="4" placeholder="network-online.target" class="border border-neutral-200 bg-transparent p-3 font-mono text-sm text-neutral-900 outline-none focus:border-neutral-900 dark:border-neutral-800 dark:text-white dark:focus:border-white"></textarea>
        </label>

        <label class="flex flex-col gap-2 text-sm">
          <span class="font-mono text-[11px] uppercase tracking-widest text-neutral-400 dark:text-neutral-600">Requires</span>
          <textarea v-model="raw.requires" rows="4" placeholder="network-online.target" class="border border-neutral-200 bg-transparent p-3 font-mono text-sm text-neutral-900 outline-none focus:border-neutral-900 dark:border-neutral-800 dark:text-white dark:focus:border-white"></textarea>
        </label>

        <label class="flex flex-col gap-2 text-sm md:col-span-2">
          <span class="font-mono text-[11px] uppercase tracking-widest text-neutral-400 dark:text-neutral-600">Wanted by</span>
          <textarea v-model="raw.wanted_by" rows="3" placeholder="default.target" class="border border-neutral-200 bg-transparent p-3 font-mono text-sm text-neutral-900 outline-none focus:border-neutral-900 dark:border-neutral-800 dark:text-white dark:focus:border-white"></textarea>
        </label>
      </div>

      <div class="flex flex-wrap gap-6 text-sm text-neutral-600 dark:text-neutral-300">
        <label class="inline-flex items-center gap-2">
          <input v-model="form.copy" type="checkbox" class="size-4">
          Copy
        </label>

        <label class="inline-flex items-center gap-2">
          <input v-model="startAfterCreate" type="checkbox" class="size-4">
          Start after create
        </label>

        <label class="inline-flex items-center gap-2">
          <input v-model="failIfExists" type="checkbox" class="size-4">
          Fail if file exists
        </label>
      </div>

      <p v-if="errorMessage" class="text-sm text-red-500 dark:text-red-400">
        {{ errorMessage }}
      </p>

      <div class="flex flex-wrap gap-3">
        <button type="submit" :disabled="isSubmitting" class="btn-fill min-w-36 px-5">
          <Save class="size-4 inline" />
          {{ isSubmitting ? 'Creating...' : 'Create volume' }}
        </button>

        <NuxtLink to="/ship/volumes" class="btn-outline min-w-30 px-5 font-medium">
          <Plus class="size-4 rotate-45 inline" />
          Cancel
        </NuxtLink>
      </div>
    </form>
  </div>
</template>
