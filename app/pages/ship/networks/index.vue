<script setup lang="ts">
definePageMeta({
  layout: 'default',
  middleware: ['auth'],
})
</script>

<template>
  <div class="rounded-2xl border border-dashed border-neutral-200 bg-white/70 p-8 text-sm text-neutral-500 backdrop-blur-sm dark:border-neutral-800 dark:bg-neutral-950/60 dark:text-neutral-400">
    Select a network to inspect it, or create a new one.
  </div>
</template>
