<script setup lang="ts">
import Grid from '~/components/grid/Grid.vue'
import GCell from '~/components/grid/GCell.vue'

interface Props {
    head?: string
    title?: string
    description?: string
}

const props = withDefaults(defineProps<Props>(), {
    head: 'ERROR',
    title: 'Generic Error Title',
    description: 'Generic error description',
})

const router = useRouter()

const handleReturn = () => {
    clearError()
    const previousPath = window.history.state?.back
    if (previousPath) {
        router.push(previousPath)
    } else {
        router.push('/')
    }
}
</script>

<template>
    <Grid :cols="1" border="1" class="w-full max-w-md">
        <GCell padding="p-10 md:p-14">
            <template #icon>
                <svg class="mx-auto h-11 w-11 text-neutral-400 dark:text-neutral-600" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" stroke-width="1.5">
                    <path d="M9 2v4M15 2v4M6 8h12l-1 5a5 5 0 0 1-10 0l-1-5Z" />
                    <path d="M3 3l18 18" />
                </svg>
            </template>

            <template #body>
                <div class="flex flex-col items-center text-center gap-3">
                    <p class="font-mono text-xs tracking-[0.2em] text-neutral-400 dark:text-neutral-600">
                        {{ props.head }}<span class="cursor-blink">_</span>
                    </p>

                    <h1 class="text-2xl font-medium text-neutral-900 dark:text-white">
                        {{ props.title }}
                    </h1>

                    <p class="text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">
                        {{ props.description }}
                    </p>

                    <button
                        class="link-underline cursor-pointer mt-4 inline-flex items-center gap-1 text-sm font-medium text-blue-600 dark:text-blue-400"
                        @click.prevent="handleReturn">
                        Go back
                        <span aria-hidden="true">↗</span>
                    </button>
                </div>
            </template>
        </GCell>
    </Grid>
</template>

<style scoped>
@keyframes cursor-blink {

    0%,
    49% {
        opacity: 1;
    }

    50%,
    100% {
        opacity: 0;
    }
}

.cursor-blink {
    animation: cursor-blink 1s step-end infinite;
}
</style>