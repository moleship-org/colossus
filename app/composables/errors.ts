import { FetchError } from 'ofetch'

interface ErrorRecord {
  name: string
  desc: string
}

/**
 * Default messages for the most common HTTP status codes.
*/
const DEFAULT_ERROR_MESSAGES: Record<number, ErrorRecord> = {
  400: { name: 'bad_request', desc: 'The submitted data is invalid.' },
  401: { name: 'unauthorized', desc: 'Incorrect username or password.' },
  403: { name: 'forbidden', desc: 'You do not have permission to perform this action.' },
  404: { name: 'not_found', desc: 'We could not find what you were looking for.' },
  408: { name: 'request_timeout', desc: 'The request took too long. Please try again.' },
  409: { name: 'conflict', desc: 'A record with that data already exists.' },
  422: { name: 'unprocessable_entity', desc: 'Please review the entered data.' },
  429: { name: 'too_many_requests', desc: 'Too many requests. Please wait a minute.' },
  500: { name: 'internal_server_error', desc: 'A server error occurred. Please try again later.' },
  502: { name: 'bad_gateway', desc: 'The server is unavailable. Please try again later.' },
  503: { name: 'service_unavailable', desc: 'The service is unavailable. Please try again later.' },
  504: { name: 'gateway_timeout', desc: 'The server took too long to respond.' },
}

const NETWORK_ERROR: ErrorRecord = {
  name: 'network_error',
  desc: 'We could not connect to the server. Please check your connection.',
}

const FALLBACK_ERROR: ErrorRecord = {
  name: 'unknown_error',
  desc: 'An error occurred. Please try again.',
}

export interface GetErrorMessageOptions {
  /** Records specific to this call, with priority over the defaults. */
  overrides?: Record<number, ErrorRecord>
  /** Record to use when there is no statusCode (network error, CORS, etc.). */
  networkError?: ErrorRecord
  /** Record to use when the status code is not mapped. */
  fallback?: ErrorRecord
  /**
   * If true, and the backend sends its own `message` in the body
   * (err.message), that text takes priority as `desc` over
   * the local mapping for codes that are not explicitly mapped.
  */
  preferServerMessage?: boolean
}

/**
 * Extracts the status code from an ofetch error, accounting for the
 * `statusCode` alias and the `response.status` field as a fallback.
*/
function extractStatusCode(err: FetchError): number | undefined {
  return err.statusCode ?? err.response?.status
}

/**
 * Extracts a message sent by the backend in the response body,
 * if it exists and is a string.
*/
function extractServerMessage(err: FetchError): string | undefined {
  const data = err.data as unknown
  if (data && typeof data === 'object' && 'message' in data) {
    const message = (data as { message?: unknown }).message
    if (typeof message === 'string' && message.trim().length > 0) {
      return message
    }
  }
  return undefined
}

/**
 * Converts any error (ideally one thrown by $fetch/useFetch)
 * into an ErrorRecord ({ name, desc }) ready to display or log.
 *
 * @example
 * try {
 *   await callApi('/auth/login', { method: 'POST', body })
 * } catch (err) {
 *   errMsg.value = getErrorRecord(err).desc
 * }
 *
 * @example with specific overrides
 * getErrorRecord(err, {
 *   overrides: { 409: { name: 'email_taken', desc: 'That email is already registered.' } },
 * })
 */
export function getErrorRecord(err: unknown, options: GetErrorMessageOptions = {}): ErrorRecord {
  const {
    overrides = {},
    networkError = NETWORK_ERROR,
    fallback = FALLBACK_ERROR,
    preferServerMessage = false,
  } = options

  if (!(err instanceof FetchError)) {
    // Not a fetch error: likely a code bug or an unexpected error unrelated
    // to the HTTP call. Do not disguise it as a network error.
    return fallback
  }

  const statusCode = extractStatusCode(err)

  if (statusCode === undefined) {
    // The request never received a response: no connection, CORS, timeout, etc.
    return networkError
  }

  const mapped = overrides[statusCode] ?? DEFAULT_ERROR_MESSAGES[statusCode]

  if (mapped && !preferServerMessage) {
    return mapped
  }

  const serverMessage = extractServerMessage(err)

  if (serverMessage) {
    return { name: mapped?.name ?? 'server_message', desc: serverMessage }
  }

  return mapped ?? fallback
}

export function getErrorMessage(err: unknown, options: GetErrorMessageOptions = {}): string {
  return getErrorRecord(err, options).desc
}

export function getErrorByStatusCode(code: number): ErrorRecord {
  return (DEFAULT_ERROR_MESSAGES[code] ?? DEFAULT_ERROR_MESSAGES[500]) as ErrorRecord
}

/**
 * Variant that also returns the statusCode, useful when the component
 * needs to make additional decisions besides displaying the message
 * (e.g. redirect on a 401, disable a button on a 429, etc.).
 */
export function parseError(err: unknown, options: GetErrorMessageOptions = {}) {
  const statusCode = err instanceof FetchError ? extractStatusCode(err) : undefined
  const record = getErrorRecord(err, options)

  return {
    statusCode,
    name: record.name,
    message: record.desc,
    isNetworkError: err instanceof FetchError && statusCode === undefined,
  }
}
