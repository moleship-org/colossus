<script setup lang="ts">
import Grid from '~/components/grid/Grid.vue'
import GCell from '~/components/grid/GCell.vue'
import { useSessionStore } from '~/stores/session'

definePageMeta({
    layout: 'default',
    middleware: ['guest']
})

useHead({
    title: 'Login',
})

const session = useSessionStore()

const form = reactive({
    username: '',
    password: '',
})

const isSubmitting = ref(false)
const errMsg = ref('')

async function handleSubmit() {
    errMsg.value = ''
    isSubmitting.value = true

    try {
        await callApi('/auth/login', {
            method: 'POST',
            body: {
                username: form.username,
                password: form.password
            }
        })
        await session.fetchSession()
        await navigateTo('/ship')
    } catch (err) {
        errMsg.value = getErrorMessage(err)
    } finally {
        isSubmitting.value = false
    }
}
</script>

<template>
    <div class="flex min-h-[80vh] items-center justify-center px-4 py-16">
        <Grid :cols="1" class="w-full max-w-md shadow-xl" border="1">
            <GCell padding="p-10 md:p-12">
                <template #icon>
                    <div class="w-full text-center m-auto">
                        <img src="~/images/icon.svg" alt="Mole sailor in a tiny boat" width="64" class="text-center m-auto">
                    </div>
                </template>

                <template #title>
                    <h1 class="text-2xl text-center m-auto mb-1 font-medium text-neutral-900 dark:text-white">
                        Colossus
                    </h1>

                    <p class="mt-1 text-sm text-neutral-500 mb-5 text-center dark:text-neutral-400">
                        Get ready to set sail on the moleship!
                    </p>
                </template>

                <template #body>
                    <form class="mt-2 flex flex-col" @submit.prevent="handleSubmit">
                        <div class="flex flex-col gap-1. mb-5">
                            <label for="username"
                                class="font-mono text-[11px] uppercase tracking-widest text-neutral-400 dark:text-neutral-600">
                                Username
                            </label>
                            <input id="username" v-model="form.username" type="text" required autocomplete="username"
                                placeholder="mole"
                                class="border-0 border-b border-neutral-200 bg-transparent py-2 text-sm text-neutral-900 outline-none transition-colors placeholder:text-neutral-400 focus:border-neutral-900 dark:border-neutral-800 dark:text-white dark:placeholder:text-neutral-600 dark:focus:border-white">
                        </div>

                        <div class="flex flex-col gap-1.5 mb-5">
                            <div class="flex items-baseline justify-between">
                                <label for="password"
                                    class="font-mono text-[11px] uppercase tracking-widest text-neutral-400 dark:text-neutral-600">
                                    Password
                                </label>
                            </div>
                            <input id="password" v-model="form.password" type="password" required
                                autocomplete="current-password" placeholder="********"
                                class="border-0 border-b border-neutral-200 bg-transparent py-2 text-sm text-neutral-900 outline-none transition-colors placeholder:text-neutral-400 focus:border-neutral-900 dark:border-neutral-800 dark:text-white dark:placeholder:text-neutral-600 dark:focus:border-white">
                        </div>

                        <p v-if="errMsg" class="text-sm text-red-500 dark:text-red-400">
                            {{ errMsg }}
                        </p>

                        <button type="submit" :disabled="isSubmitting"
                            class="btn-fill mt-2 py-2.5 gap-1">
                            {{ isSubmitting ? 'Loggin...' : 'Log In' }}
                        </button>
                    </form>
                </template>
            </GCell>
        </Grid>
    </div>
</template>

<style scoped></style>
