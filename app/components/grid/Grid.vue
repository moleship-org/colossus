<script setup lang="ts">
/**
 * Grid
 */
interface Props {
    /** mobile */
    cols?: number;
    /** md (768px) */
    colsMd?: number;
    /** lg (1024px) */
    colsLg?: number;
    /** border color */
    lineColor?: string;
    /** border */
    border?: string;
}

const props = withDefaults(defineProps<Props>(), {
    cols: 1,
    lineColor: 'bg-neutral-200 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-800',
    border: '0',
})

const style = computed(() => ({
    '--grid-cols': props.cols,
    '--grid-cols-md': props.colsMd ?? props.cols,
    '--grid-cols-lg': props.colsLg ?? props.colsMd ?? props.cols,
    '--grid-border': `${props.border}px`,
}))
</script>

<template>
    <div class="grid grid-auto-flow gap-px overflow-hidden border-(length:--grid-border) grid-cols-[repeat(var(--grid-cols),minmax(0,1fr))] md:grid-cols-[repeat(var(--grid-cols-md),minmax(0,1fr))] lg:grid-cols-[repeat(var(--grid-cols-lg),minmax(0,1fr))]"
        :class="[lineColor]" :style="style">
        <slot />
    </div>
</template>