<script setup lang="ts">
import Grid from '~/components/grid/Grid.vue'
import GCell from '~/components/grid/GCell.vue'
import { LogOut, LucideBox, LucideContainer, LucideDatabase, LucideHouse, LucideImage, LucideNetwork, LucideSettings2 } from '@lucide/vue'

definePageMeta({
    layout: 'default',
    middleware: ['auth'],
})

useHead({
    title: 'Ship',
})

const route = useRoute()
const session = useSessionStore()

const sections = [
    { label: 'Home', path: '/ship', icon: LucideHouse },
    { label: 'Libpod', path: '/ship/libpod', icon: LucideBox },
    { label: 'Systemd', path: '/ship/systemd', icon: LucideSettings2 },
    { label: 'Containers', path: '/ship/containers', icon: LucideContainer },
    //{ label: 'Volumes', path: '/ship/volumes', icon: LucideDatabase },
    //{ label: 'Networks', path: '/ship/networks', icon: LucideNetwork },
    //{ label: 'Images', path: '/ship/images', icon: LucideImage },
]

const isActive = (path: string) => route.path === path

async function handleLogout() {
    await session.logout()
    await session.fetchSession()
    await navigateTo('/')
}
</script>

<template>
    <div v-if="session.isLoggedIn" class="flex min-h-[80vh] items-center justify-center px-4 py-16">
        <Grid :cols="1" :cols-lg="4" border="1" class="w-full max-w-7xl min-h-[85vh] shadow-xl">
            <GCell :col-span="1" padding="p-5 md:p-6">
                <template #title>
                    <div class="flex items-center justify-between gap-4">
                        <h1 class="text-lg font-medium text-neutral-900 dark:text-white">
                            Ship
                        </h1>
                        <button type="button"
                            class="logout-btn cursor-pointer text-xs text-neutral-500 dark:text-neutral-400"
                            @click="handleLogout">
                            <LogOut aria-hidden="true" class="size-4 shrink-0 inline" /> Sign out
                        </button>
                    </div>
                </template>

                <template #body>
                    <nav aria-label="Ship sections" class="flex flex-col gap-1">
                        <NuxtLink v-for="section in sections" :key="section.path" :to="section.path"
                            class="flex items-center gap-2 border-l-2 px-3 py-2 text-sm transition-colors"
                            :class="isActive(section.path)
                                ? 'border-blue-500 text-neutral-900 dark:border-blue-400 dark:text-white'
                                : 'border-transparent text-neutral-500 hover:border-neutral-300 hover:text-neutral-900 dark:text-neutral-400 dark:hover:border-neutral-700 dark:hover:text-white'">
                            <span class="text-neutral gap-2">
                                <component :is="section.icon" aria-hidden="true" class="size-4 shrink-0 inline" />
                                {{ section.label }}
                            </span>
                        </NuxtLink>
                    </nav>
                </template>
            </GCell>

            <GCell :col-span-lg="3" padding="p-6 md:p-8" class="min-h-0 overflow-y-auto">
                <NuxtPage />
            </GCell>
        </Grid>
    </div>
</template>

<style scoped>
.logout-btn {
    color: #ec3746;
}
.dark .logout-btn {
    color: #f72e3f;
}

nav a {
    color: var(--text-neutral);
}
</style>
