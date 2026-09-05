export default defineNuxtRouteMiddleware(async () => {
  const session = useSessionStore()

  if (session.status === 'idle') {
    await session.fetchSession()
  }

  if (session.status === 'unauthenticated') {
    return await navigateTo('/login', { redirectCode: 302 })
  }
})