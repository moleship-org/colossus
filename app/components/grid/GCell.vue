<script setup lang="ts">
/**
 * GCell (Grid Cell)
 */
interface Props {
    colSpan?: number
    colSpanMd?: number
    colSpanLg?: number
    rowSpan?: number
    href?: string
    linkLabel?: string
    padding?: string
    pattern?: boolean
    bg?: string
}

const props = withDefaults(defineProps<Props>(), {
    colSpan: 1,
    rowSpan: 1,
    padding: 'p-4 md:p-6',
})

const patternClass = computed(() => (props.pattern ? 'pattern-hatch' : ''))
const cellBg = computed(() => (props.bg ? props.bg : 'bg-white dark:bg-neutral-950'))

const style = computed(() => ({
    '--span': props.colSpan,
    '--span-md': props.colSpanMd ?? props.colSpan,
    '--span-lg': props.colSpanLg ?? props.colSpanMd ?? props.colSpan,
    '--row-span': props.rowSpan,
}))

const slots = useSlots()
</script>

<template>
    <div class="relative flex flex-col min-h-4 col-span-(--span) md:col-span-(--span-md) lg:col-span-(--span-lg) row-span-(--row-span) border-none"
        :class="[cellBg, patternClass]" :style="style">
        <template v-if="slots.icon || slots.title || slots.body || slots.footer || href">
            <div class="relative flex flex-col gap-3" :class="padding">
                <!-- Icon -->
                <div v-if="slots.icon" class="mb-1 text-neutral-800 dark:text-white">
                    <slot name="icon" />
                </div>

                <!-- Title -->
                <div v-if="slots.title" class="text-neutral-800 dark:text-white">
                    <slot name="title" />
                </div>

                <!-- Body -->
                <div v-if="slots.body" class="flex flex-col gap-3 w-full text-neutral-600 dark:text-white">
                    <slot name="body" />
                </div>

                <!-- Footer -->
                <div v-if="slots.footer"
                    class="mt-2 pt-2 text-sm/3 leading-relaxed text-neutral-400 dark:text-neutral-500">
                    <slot name="footer" />
                </div>

                <!-- Link -->
                <div v-if="href" class="mt-2 pt-2">
                    <NuxtLink :to="href"
                        class="link-underline text-sm inline-flex items-center gap-1 font-medium text-blue-600 transition-colors hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300">
                        {{ linkLabel ?? href }}
                        <span aria-hidden="true">↗</span>
                    </NuxtLink>
                </div>
            </div>
        </template>
        <div v-if="slots.default"
            class="relative flex flex-1 flex-col p-0 col-span-(--span) md:col-span-(--span-md) lg:col-span-(--span-lg) row-span-(--row-span)">
            <slot />
        </div>
    </div>
</template>

<style scoped></style>