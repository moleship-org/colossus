import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath } from 'node:url'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  runtimeConfig: {
    apiBase: process.env.NUXT_API_BASE || 'http://localhost:5000/api/v1',
  },
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  app: {
    pageTransition: { name: 'page', mode: 'out-in' },
    layoutTransition: { name: 'layout', mode: 'out-in' },
  },
  routeRules: {
    '/api/**': { proxy: `${process.env.NUXT_API_BASE || 'http://localhost:5000/api/v1'}/**` },
  },
  alias: {
    images: fileURLToPath(new URL('./assets/images', import.meta.url)),
    svg: fileURLToPath(new URL('./assets/svg', import.meta.url)),
    styles: fileURLToPath(new URL('./assets/styles', import.meta.url)),
  },
  css: ['styles/main.css'],
  vite: {
    plugins: [tailwindcss()],
  },
  modules: ['@nuxt/fonts', '@nuxtjs/color-mode', '@pinia/nuxt', '@nuxt/eslint'],
  pinia: {
    storesDirs: ['./stores/**'],
  },
})