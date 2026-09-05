export default defineNuxtRouteMiddleware(async () => {
  const session = useSessionStore()

  if (session.status === 'idle') {
    await session.fetchSession()
  }

  if (session.status === 'authenticated') {
    return await navigateTo('/ship', { redirectCode: 302 })
  }
})