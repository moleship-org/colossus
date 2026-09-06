<script setup lang="ts">
useHead({
  meta: [
    {
      name: 'robots',
      content: 'noindex, nofollow, noarchive',
    },
  ],
  titleTemplate: title => title ? `${title} - Colossus (Moleship)` : 'Colossus (Moleship)',
})
</script>

<template>
  <div class="relative min-h-screen overflow-hidden">
    <NuxtRouteAnnouncer />

    <!-- Parent content (over the waves) -->
    <div class="relative z-10">
      <NuxtLayout>
        <NuxtPage />
      </NuxtLayout>
    </div>

    <!-- Wave container-->
    <div class="wave-container absolute bottom-0 left-0 w-full h-[45%] md:h-[50%] z-0 pointer-events-none">

      <!-- Back wave -->
      <div class="wave-layer wave-back opacity-40">
        <svg class="w-full h-full" viewBox="0 0 1200 300" preserveAspectRatio="none">
          <path fill="currentColor" d="M0,150 C150,220 350,80 600,150 C850,220 1050,80 1200,150 L1200,300 L0,300 Z" />
          <path
fill="currentColor" transform="translate(600,0)"
            d="M0,150 C150,220 350,80 600,150 C850,220 1050,80 1200,150 L1200,300 L0,300 Z" />
        </svg>
      </div>

      <!-- Mid wave -->
      <div class="wave-layer wave-mid opacity-60">
        <svg class="w-full h-full" viewBox="0 0 1200 300" preserveAspectRatio="none">
          <path
fill="currentColor"
            d="M0,170 C200,100 400,220 600,170 C800,120 1000,220 1200,170 L1200,300 L0,300 Z" />
          <path
fill="currentColor" transform="translate(600,0)"
            d="M0,170 C200,100 400,220 600,170 C800,120 1000,220 1200,170 L1200,300 L0,300 Z" />
        </svg>
      </div>

      <!-- Front wave -->
      <div class="wave-layer wave-front opacity-90">
        <svg class="w-full h-full" viewBox="0 0 1200 300" preserveAspectRatio="none">
          <path
fill="currentColor"
            d="M0,190 C180,140 420,240 600,190 C780,140 1020,240 1200,190 L1200,300 L0,300 Z" />
          <path
fill="currentColor" transform="translate(600,0)"
            d="M0,190 C180,140 420,240 600,190 C780,140 1020,240 1200,190 L1200,300 L0,300 Z" />
        </svg>
      </div>

    </div>

    <!-- Brillo suave arriba del mar -->
    <div
      class="absolute bottom-0 left-0 w-full h-[45%] md:h-[50%] z-5 bg-linear-to-t from-transparent via-transparent to-cyan-300/10 pointer-events-none">
    </div>
  </div>
</template>
