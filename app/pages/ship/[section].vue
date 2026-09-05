<script setup lang="ts">
const route = useRoute()
const section = computed(() => String(route.params.section))
const title = computed(() => section.value.charAt(0).toUpperCase() + section.value.slice(1))

useHead(() => ({
    title: title.value,
}))
</script>

<template>
    <div class="flex flex-col gap-2 p-4 md:p-6">
        <h2 class="text-2xl font-medium text-neutral-900 dark:text-white">
            {{ title }}
        </h2>
    </div>
</template>
