<script setup lang="ts">
import type { NuxtError } from '#app'
import ErrorBox from '~/components/errors/ErrorBox.vue';

const props = defineProps<{
  error: NuxtError
}>()

const statusCode = computed(() => props.error.status ?? 500)

const err = computed(
  () => getErrorRecord(props.error, {fallback: {name: "internal_server_error", desc: "Internal error"}}),
)
</script>

<template>
  <div class="flex min-h-[90vh] items-center justify-center px-4 py-24">
    <ErrorBox :head="`ERROR ${statusCode}`" :title="err.name.toUpperCase()" :description="err.desc" />
  </div>
</template>
