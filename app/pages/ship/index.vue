<script setup lang="ts">
import { LucideHome } from '@lucide/vue';

definePageMeta({
    layout: 'default',
    middleware: ['auth'],
})

useHead({
    title: 'Home',
})

const session = useSessionStore()

</script>

<template>
    <div class="p-6 md:p-8 overflow-auto">
        <h1 class="text-2xl">
            Home
        </h1>

        <div class="text-base font-light mt-4 mb-4 overflow-auto">
            <p>
                Hello, <span class="font-bold">{{ session.username }}</span>!
            </p>
            <p>
                Welcome to your own <a href="https://github.com/moleship-org/colossus" target="_blank">Colossus</a> instance. Here you can handle everything related to your local quadlet unit files.
            </p>
        </div>
    </div>
</template>

<style scoped>
p {
    margin-bottom: 10px;
}
</style>
