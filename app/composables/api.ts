import type { UseFetchOptions } from '#app'
import type { NitroFetchRequest, NitroFetchOptions } from 'nitropack'

const apiFetch = $fetch.create({
  baseURL: '/api',
  credentials: 'include',
})

function isUnsafeMethod(method?: string) {
  const m = (method ?? 'GET').toUpperCase()
  return m === 'POST' || m === 'PUT' || m === 'PATCH' || m === 'DELETE'
}

function readCookie(name: string) {
  if (import.meta.server) return null

  const prefix = `${name}=`
  const found = document.cookie
    .split(';')
    .map(v => v.trim())
    .find(v => v.startsWith(prefix))

  return found ? decodeURIComponent(found.slice(prefix.length)) : null
}

export function callApi<T>(
  url: NitroFetchRequest,
  options: NitroFetchOptions<NitroFetchRequest> = {},
) {
  const method = (options.method ?? 'GET').toString().toUpperCase()

  if (import.meta.server) {
    const headers = useRequestHeaders(['cookie'])

    return apiFetch<T>(url, {
      ...options,
      credentials: 'include',
      headers: {
        ...headers,
        ...options.headers,
      },
    })
  }

  const csrfToken = isUnsafeMethod(method)
    ? readCookie('moleship_csrf_token')
    : null

  return apiFetch<T>(url, {
    ...options,
    credentials: 'include',
    headers: {
      ...(csrfToken ? { 'X-CSRF-Token': csrfToken } : {}),
      ...options.headers,
    },
  })
}

export function useApi<T>(
  url: NitroFetchRequest | Ref<NitroFetchRequest> | (() => NitroFetchRequest),
  options: UseFetchOptions<T> = {},
) {
  const method = (options.method ?? 'GET').toString().toUpperCase()
  const csrfToken = import.meta.client && isUnsafeMethod(method)
    ? readCookie('moleship_csrf_token')
    : null

  return useFetch(url, {
    baseURL: '/api',
    credentials: 'include',
    headers: {
      ...(csrfToken ? { 'X-CSRF-Token': csrfToken } : {}),
      ...(options.headers ?? {}),
    },
    ...options,
  })
}
