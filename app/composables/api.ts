import type { UseFetchOptions } from '#app'
import type { NitroFetchRequest, NitroFetchOptions } from 'nitropack'

const apiFetch = $fetch.create({
  baseURL: '/api',
})

export function callApi<T>(
  url: NitroFetchRequest,
  options: NitroFetchOptions<NitroFetchRequest> = {},
) {
  if (import.meta.server) {
    const headers = useRequestHeaders(['cookie'])

    return apiFetch<T>(url, {
      ...options,
      headers: {
        ...headers,
        ...options.headers,
      },
    })
  }

  return apiFetch<T>(url, options)
}

export function useApi<T>(
  url: NitroFetchRequest | Ref<NitroFetchRequest> | (() => NitroFetchRequest),
  options: UseFetchOptions<T> = {},
) {
  return useFetch(url, {
    baseURL: '/api',
    credentials: 'include',
    ...options,
  })
}