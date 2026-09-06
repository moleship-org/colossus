<script setup lang="ts">
import { ArrowLeft, Plus, Save } from '@lucide/vue'
import type { QuadletNetworkUnit } from '~/composables/useQuadlet'
import {
  buildQuadletNetworkPayload,
  createEmptyQuadletNetworkRaw,
  createEmptyQuadletNetworkUnit,
} from '~/composables/quadlet-network-form'

definePageMeta({
  layout: 'default',
  middleware: ['auth'],
})

useHead({
  title: 'New network',
})

const networks = useQuadletNetworks()
const router = useRouter()

const form = reactive<QuadletNetworkUnit>(createEmptyQuadletNetworkUnit())
const raw = reactive(createEmptyQuadletNetworkRaw())

const startAfterCreate = ref(true)
const failIfExists = ref(true)
const isSubmitting = ref(false)
const errorMessage = ref('')

async function handleSubmit() {
  errorMessage.value = ''
  isSubmitting.value = true

  try {
    const payload = buildQuadletNetworkPayload(form, raw)
    await networks.create(payload, {
      start: startAfterCreate.value,
      failIfExists: failIfExists.value,
    })
    await navigateTo(`/ship/networks/${encodeURIComponent(payload.name)}`)
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
          /ship/networks/new
        </p>
        <h2 class="mt-2 text-2xl font-medium text-neutral-900 dark:text-white">
          Create network
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
          <input v-model="form.name" type="text" placeholder="frontend" class="border border-neutral-200 bg-transparent px-3 py-2 text-neutral-900 outline-none focus:border-neutral-900 dark:border-neutral-800 dark:text-white dark:focus:border-white">
        </label>

        <label class="flex flex-col gap-2 text-sm">
          <span class="font-mono text-[11px] uppercase tracking-widest text-neutral-400 dark:text-neutral-600">Network name</span>
          <input v-model="form.network_name" type="text" placeholder="frontend" class="border border-neutral-200 bg-transparent px-3 py-2 text-neutral-900 outline-none focus:border-neutral-900 dark:border-neutral-800 dark:text-white dark:focus:border-white">
        </label>

        <label class="flex flex-col gap-2 text-sm md:col-span-2">
          <span class="font-mono text-[11px] uppercase tracking-widest text-neutral-400 dark:text-neutral-600">Description</span>
          <input v-model="form.description" type="text" placeholder="Public facing network" class="border border-neutral-200 bg-transparent px-3 py-2 text-neutral-900 outline-none focus:border-neutral-900 dark:border-neutral-800 dark:text-white dark:focus:border-white">
        </label>

        <label class="flex flex-col gap-2 text-sm">
          <span class="font-mono text-[11px] uppercase tracking-widest text-neutral-400 dark:text-neutral-600">Driver</span>
          <input v-model="form.driver" type="text" placeholder="bridge" class="border border-neutral-200 bg-transparent px-3 py-2 text-neutral-900 outline-none focus:border-neutral-900 dark:border-neutral-800 dark:text-white dark:focus:border-white">
        </label>

        <label class="flex flex-col gap-2 text-sm">
          <span class="font-mono text-[11px] uppercase tracking-widest text-neutral-400 dark:text-neutral-600">IPAM driver</span>
          <input v-model="form.ipam_driver" type="text" placeholder="dhcp" class="border border-neutral-200 bg-transparent px-3 py-2 text-neutral-900 outline-none focus:border-neutral-900 dark:border-neutral-800 dark:text-white dark:focus:border-white">
        </label>

        <label class="flex flex-col gap-2 text-sm md:col-span-2">
          <span class="font-mono text-[11px] uppercase tracking-widest text-neutral-400 dark:text-neutral-600">Interface name</span>
          <input v-model="form.interface_name" type="text" placeholder="enp1" class="border border-neutral-200 bg-transparent px-3 py-2 text-neutral-900 outline-none focus:border-neutral-900 dark:border-neutral-800 dark:text-white dark:focus:border-white">
        </label>
      </div>

      <div class="grid gap-4 md:grid-cols-2">
        <label class="flex flex-col gap-2 text-sm">
          <span class="font-mono text-[11px] uppercase tracking-widest text-neutral-400 dark:text-neutral-600">Subnet</span>
          <textarea v-model="raw.subnet" rows="4" placeholder="192.5.0.0/16" class="border border-neutral-200 bg-transparent p-3 font-mono text-sm text-neutral-900 outline-none focus:border-neutral-900 dark:border-neutral-800 dark:text-white dark:focus:border-white"></textarea>
        </label>

        <label class="flex flex-col gap-2 text-sm">
          <span class="font-mono text-[11px] uppercase tracking-widest text-neutral-400 dark:text-neutral-600">Gateway</span>
          <textarea v-model="raw.gateway" rows="4" placeholder="192.168.55.3" class="border border-neutral-200 bg-transparent p-3 font-mono text-sm text-neutral-900 outline-none focus:border-neutral-900 dark:border-neutral-800 dark:text-white dark:focus:border-white"></textarea>
        </label>

        <label class="flex flex-col gap-2 text-sm">
          <span class="font-mono text-[11px] uppercase tracking-widest text-neutral-400 dark:text-neutral-600">IP range</span>
          <textarea v-model="raw.ip_range" rows="4" placeholder="192.168.55.128/25" class="border border-neutral-200 bg-transparent p-3 font-mono text-sm text-neutral-900 outline-none focus:border-neutral-900 dark:border-neutral-800 dark:text-white dark:focus:border-white"></textarea>
        </label>

        <label class="flex flex-col gap-2 text-sm">
          <span class="font-mono text-[11px] uppercase tracking-widest text-neutral-400 dark:text-neutral-600">DNS</span>
          <textarea v-model="raw.dns" rows="4" placeholder="192.168.55.1" class="border border-neutral-200 bg-transparent p-3 font-mono text-sm text-neutral-900 outline-none focus:border-neutral-900 dark:border-neutral-800 dark:text-white dark:focus:border-white"></textarea>
        </label>

        <label class="flex flex-col gap-2 text-sm">
          <span class="font-mono text-[11px] uppercase tracking-widest text-neutral-400 dark:text-neutral-600">Options</span>
          <textarea v-model="raw.options" rows="4" placeholder="isolate=true" class="border border-neutral-200 bg-transparent p-3 font-mono text-sm text-neutral-900 outline-none focus:border-neutral-900 dark:border-neutral-800 dark:text-white dark:focus:border-white"></textarea>
        </label>

        <label class="flex flex-col gap-2 text-sm">
          <span class="font-mono text-[11px] uppercase tracking-widest text-neutral-400 dark:text-neutral-600">Labels</span>
          <textarea v-model="raw.labels" rows="4" placeholder="app=frontend" class="border border-neutral-200 bg-transparent p-3 font-mono text-sm text-neutral-900 outline-none focus:border-neutral-900 dark:border-neutral-800 dark:text-white dark:focus:border-white"></textarea>
        </label>

        <label class="flex flex-col gap-2 text-sm">
          <span class="font-mono text-[11px] uppercase tracking-widest text-neutral-400 dark:text-neutral-600">Containers conf modules</span>
          <textarea v-model="raw.containers_conf_modules" rows="4" placeholder="/etc/nvd.conf" class="border border-neutral-200 bg-transparent p-3 font-mono text-sm text-neutral-900 outline-none focus:border-neutral-900 dark:border-neutral-800 dark:text-white dark:focus:border-white"></textarea>
        </label>

        <label class="flex flex-col gap-2 text-sm">
          <span class="font-mono text-[11px] uppercase tracking-widest text-neutral-400 dark:text-neutral-600">Global arguments</span>
          <textarea v-model="raw.global_args" rows="4" placeholder="--log-level=debug" class="border border-neutral-200 bg-transparent p-3 font-mono text-sm text-neutral-900 outline-none focus:border-neutral-900 dark:border-neutral-800 dark:text-white dark:focus:border-white"></textarea>
        </label>

        <label class="flex flex-col gap-2 text-sm">
          <span class="font-mono text-[11px] uppercase tracking-widest text-neutral-400 dark:text-neutral-600">Podman arguments</span>
          <textarea v-model="raw.podman_args" rows="4" placeholder="--dns=192.168.55.1" class="border border-neutral-200 bg-transparent p-3 font-mono text-sm text-neutral-900 outline-none focus:border-neutral-900 dark:border-neutral-800 dark:text-white dark:focus:border-white"></textarea>
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
          <input v-model="form.internal" type="checkbox" class="size-4">
          Internal
        </label>

        <label class="inline-flex items-center gap-2">
          <input v-model="form.ipv6" type="checkbox" class="size-4">
          IPv6
        </label>

        <label class="inline-flex items-center gap-2">
          <input v-model="form.disable_dns" type="checkbox" class="size-4">
          Disable DNS
        </label>

        <label class="inline-flex items-center gap-2">
          <input v-model="form.network_delete_on_stop" type="checkbox" class="size-4">
          Delete on stop
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
          {{ isSubmitting ? 'Creating...' : 'Create network' }}
        </button>

        <NuxtLink to="/ship/networks" class="btn-outline min-w-30 px-5 font-medium">
          <Plus class="size-4 rotate-45 inline" />
          Cancel
        </NuxtLink>
      </div>
    </form>
  </div>
</template>
