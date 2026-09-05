type AuthState = 'idle' | 'pending' | 'authenticated' | 'unauthenticated'

interface SessionResponse {
  username: string
}

export const useSessionStore = defineStore('session', () => {
  const status = ref<AuthState>('idle')
  const username = ref('')

  const isLoggedIn: ComputedRef<boolean> = computed(() => status.value === 'authenticated')

  async function fetchSession() {
    status.value = 'pending'
    try {
      const res = await callApi<SessionResponse>('/auth/session', { method: 'GET' })
      username.value = res.username
      status.value = 'authenticated'
    } catch (err) {
      username.value = ''
      status.value = 'unauthenticated'
    }
  }

  async function login(user: string, password: string) {
    status.value = 'pending'
    try {
      await callApi('/auth/login', {
        method: 'POST',
        body: { username: user, password },
      })
      username.value = user
      status.value = 'authenticated'
    } catch (err) {
      username.value = ''
      status.value = 'unauthenticated'
      throw err
    }
  }

  async function logout() {
    try {
      await callApi('/auth/logout', { method: 'POST' })
    } catch (err) {
      console.error(err)
    } finally {
      username.value = ''
      status.value = 'unauthenticated'
    }
  }

  return {
    status: readonly(status),
    username: readonly(username),
    isLoggedIn,
    fetchSession,
    login,
    logout,
  }
})