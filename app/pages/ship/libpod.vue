<script setup lang="ts">
definePageMeta({
    layout: 'default',
    middleware: ['auth'],
})

useHead({
    title: 'Libpod',
})

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'HEAD'
type HeaderRow = {
    id: number
    key: string
    value: string
}

type PersistedLibpodState = {
    resource: string
    method: HttpMethod
    requestBody: string
    headerRows: HeaderRow[]
    nextHeaderRowId: number
}

const createDefaultHeaderRow = (): HeaderRow => ({
    id: 1,
    key: '',
    value: '',
})

const persistedState = usePersistentState<PersistedLibpodState>('ship:libpod', () => ({
    resource: '',
    method: 'GET',
    requestBody: '',
    headerRows: [createDefaultHeaderRow()],
    nextHeaderRowId: 2,
}), {
    parser: (value) => {
        const parsed = JSON.parse(value) as Partial<PersistedLibpodState>
        const headerRows = Array.isArray(parsed.headerRows) && parsed.headerRows.length
            ? parsed.headerRows.map((row, index) => ({
                id: typeof row?.id === 'number' ? row.id : index + 1,
                key: typeof row?.key === 'string' ? row.key : '',
                value: typeof row?.value === 'string' ? row.value : '',
            }))
            : [createDefaultHeaderRow()]
        const highestHeaderRowId = headerRows.reduce((maxId, row) => Math.max(maxId, row.id), 0)
        const nextHeaderRowId = typeof parsed.nextHeaderRowId === 'number'
            ? Math.max(parsed.nextHeaderRowId, highestHeaderRowId + 1)
            : highestHeaderRowId + 1

        return {
            resource: typeof parsed.resource === 'string' ? parsed.resource : '',
            method: parsed.method === 'POST' || parsed.method === 'PUT' || parsed.method === 'DELETE' || parsed.method === 'HEAD'
                ? parsed.method
                : 'GET',
            requestBody: typeof parsed.requestBody === 'string' ? parsed.requestBody : '',
            headerRows,
            nextHeaderRowId,
        }
    },
})

const resource = computed({
    get: () => persistedState.value.resource,
    set: value => {
        persistedState.value.resource = value
    },
})
const method = computed({
    get: () => persistedState.value.method,
    set: value => {
        persistedState.value.method = value
    },
})
const requestBody = computed({
    get: () => persistedState.value.requestBody,
    set: value => {
        persistedState.value.requestBody = value
    },
})
const headerRows = computed({
    get: () => persistedState.value.headerRows,
    set: value => {
        persistedState.value.headerRows = value
    },
})
const nextHeaderRowId = computed({
    get: () => persistedState.value.nextHeaderRowId,
    set: value => {
        persistedState.value.nextHeaderRowId = value
    },
})
const result = ref<unknown>()
const errorMessage = ref('')
const isLoading = ref(false)
const isStatusLoading = ref(true)
const isLibpodEnabled = ref(true)
const libpodDisabledMessage = 'Libpod direct proxy is disabled. Enable the libpod direct proxy manually to use this page.'

const methodsWithBody = new Set<HttpMethod>(['POST', 'PUT'])
const requestBodyPlaceholder = '{\n  "key": "value"\n}'
const requestBodyDisabledPlaceholder = 'Request body is only used for POST and PUT requests.'

const formattedResult = computed(() => {
    if (result.value === undefined) {
        return 'No request made yet.'
    }

    if (typeof result.value === 'string') {
        return result.value
    }

    return JSON.stringify(result.value, null, 2)
})

const usesRequestBody = computed(() => methodsWithBody.has(method.value))
const isSubmitDisabled = computed(() => isLoading.value || isStatusLoading.value || !isLibpodEnabled.value)

function addHeaderRow() {
    headerRows.value.push({
        id: nextHeaderRowId.value,
        key: '',
        value: '',
    })
    nextHeaderRowId.value += 1
}

function removeHeaderRow(id: number) {
    headerRows.value = headerRows.value.filter(row => row.id !== id)

    if (!headerRows.value.length) {
        addHeaderRow()
    }
}

function buildHeaders() {
    const headers: Record<string, string> = {}

    for (const row of headerRows.value) {
        const key = row.key.trim()

        if (!key) {
            continue
        }

        headers[key] = row.value.trim()
    }

    return headers
}

function buildRequestBody(headers: Record<string, string>) {
    const body = requestBody.value.trim()

    if (!usesRequestBody.value || !body) {
        return undefined
    }

    const contentTypeHeader = Object.entries(headers).find(([key]) => key.toLowerCase() === 'content-type')?.[1] ?? ''
    const normalizedContentType = contentTypeHeader.toLowerCase()

    if (!contentTypeHeader || normalizedContentType.includes('application/json')) {
        try {
            return JSON.parse(body)
        } catch {
            throw new Error('Request body must be valid JSON when Content-Type is application/json or omitted.')
        }
    }

    return body
}

async function loadLibpodStatus() {
    isStatusLoading.value = true

    try {
        const status = await callApi('/libpod') as { enabled?: boolean }
        isLibpodEnabled.value = Boolean(status?.enabled)
    } catch (err) {
        isLibpodEnabled.value = false
        errorMessage.value = getErrorMessage(err)
    } finally {
        isStatusLoading.value = false
    }
}

async function handleSubmit() {
    if (isStatusLoading.value) {
        return
    }

    if (!isLibpodEnabled.value) {
        errorMessage.value = libpodDisabledMessage
        result.value = undefined
        return
    }
    const path = resource.value.trim()

    if (!path) {
        errorMessage.value = 'Enter a resource to search.'
        result.value = undefined
        return
    }

    errorMessage.value = ''
    result.value = undefined
    isLoading.value = true

    try {
        const headers = buildHeaders()
        const body = buildRequestBody(headers)
        const encodedPath = path.split('/').map(encodeURIComponent).join('/')

        result.value = await callApi(`/libpod/${encodedPath}`, {
            method: method.value,
            headers,
            body,
        })
    } catch (err) {
        errorMessage.value = getErrorMessage(err)
    } finally {
        isLoading.value = false
    }
}

await loadLibpodStatus()
</script>

<template>
    <div class="flex flex-col gap-8 p-6 md:p-8">
        <div>
            <h1 class="mt-2 text-2xl font-medium text-neutral-900 dark:text-white">
                Libpod
            </h1>
        </div>

        <div v-if="!isStatusLoading && !isLibpodEnabled">
            <p class="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-200">
                You need to enable the libpod direct proxy manually using <span class="font-bold">MOLESHIP_ENABLE_LIBPOD_PROXY=true</span> before using this page.
            </p>
        </div>
        <div v-else>
            <form class="flex flex-col gap-6" @submit.prevent="handleSubmit">
                <div class="grid gap-4 md:grid-cols-[minmax(0,1fr)_10rem_auto] md:items-end">
                    <div class="flex flex-col gap-2">
                        <label for="libpod-resource"
                            class="font-mono text-[11px] uppercase tracking-widest text-neutral-400 dark:text-neutral-600">
                            Resource
                        </label>

                        <div
                            class="flex min-w-0 items-center border-b border-neutral-200 text-sm text-neutral-900 focus-within:border-neutral-900 dark:border-neutral-800 dark:text-white dark:focus-within:border-white">
                            <label for="libpod-resource" class="shrink-0 py-2 text-neutral-400 dark:text-neutral-600">libpod/</label>
                            <input id="libpod-resource" v-model="resource" type="text" autocomplete="off"
                                placeholder="...containers/json"
                                class="min-w-0 flex-1 border-0 bg-transparent py-2 pl-0.5 outline-none placeholder:text-neutral-400 dark:placeholder:text-neutral-600">
                        </div>
                    </div>

                    <div class="flex flex-col gap-2">
                        <label for="libpod-method"
                            class="font-mono text-[11px] uppercase tracking-widest text-neutral-400 dark:text-neutral-600">
                            Method
                        </label>
                        <select id="libpod-method" v-model="method"
                            class="border border-neutral-200 bg-transparent px-3 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-900 dark:border-neutral-800 dark:text-white dark:focus:border-white">
                            <option value="GET">GET</option>
                            <option value="POST">POST</option>
                            <option value="PUT">PUT</option>
                            <option value="DELETE">DELETE</option>
                            <option value="HEAD">HEAD</option>
                        </select>
                    </div>

                    <div>
                        <button type="submit" :disabled="isSubmitDisabled"
                            class="btn-fill min-w-27.5 px-5">
                            {{ isStatusLoading ? 'Checking...' : isLoading ? 'Loading...' : method }}
                        </button>
                    </div>
                </div>

                <div class="flex flex-col gap-3">
                    <div class="flex items-center justify-between gap-3">
                        <h2 class="font-mono text-[11px] uppercase tracking-widest text-neutral-400 dark:text-neutral-600">
                            Custom headers
                        </h2>

                        <button type="button" @click="addHeaderRow"
                            class="btn-ghost text-xs font-medium">
                            Add header
                        </button>
                    </div>

                    <div class="flex flex-col gap-2">
                        <div v-for="row in headerRows" :key="row.id" class="grid gap-2 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]">
                            <input v-model="row.key" type="text" placeholder="Header name"
                                class="border border-neutral-200 bg-transparent px-3 py-2 text-sm text-neutral-900 outline-none placeholder:text-neutral-400 focus:border-neutral-900 dark:border-neutral-800 dark:text-white dark:placeholder:text-neutral-600 dark:focus:border-white">
                            <input v-model="row.value" type="text" placeholder="Header value"
                                class="border border-neutral-200 bg-transparent px-3 py-2 text-sm text-neutral-900 outline-none placeholder:text-neutral-400 focus:border-neutral-900 dark:border-neutral-800 dark:text-white dark:placeholder:text-neutral-600 dark:focus:border-white">
                            <button type="button" @click="removeHeaderRow(row.id)"
                                class="btn-outline px-3">
                                Remove
                            </button>
                        </div>
                    </div>
                </div>

                <div class="flex flex-col gap-2">
                    <label for="libpod-body"
                        class="font-mono text-[11px] uppercase tracking-widest text-neutral-400 dark:text-neutral-600">
                        Request body
                    </label>
                    <textarea id="libpod-body" v-model="requestBody" rows="10"
                        :disabled="!usesRequestBody"
                        :placeholder="usesRequestBody ? requestBodyPlaceholder : requestBodyDisabledPlaceholder"
                        class="min-h-48 border border-neutral-200 bg-transparent p-3 font-mono text-sm text-neutral-900 outline-none placeholder:text-neutral-400 focus:border-neutral-900 disabled:cursor-not-allowed disabled:opacity-60 dark:border-neutral-800 dark:text-white dark:placeholder:text-neutral-600 dark:focus:border-white"></textarea>
                </div>

                <p v-if="errorMessage" class="text-sm text-red-500 dark:text-red-400">
                    {{ errorMessage }}
                </p>
            </form>

            <div class="flex flex-col gap-3">
                <h2 class="font-mono text-[11px] uppercase tracking-widest text-neutral-400 dark:text-neutral-600">
                    Response body
                </h2>
                <pre
                    class="min-h-80 max-h-60 overflow-x-auto border border-neutral-200 bg-neutral-50 p-4 text-xs leading-relaxed whitespace-pre-wrap wrap-break-word text-neutral-700 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300">{{ formattedResult }}</pre>
            </div>
        </div>
    </div>
</template>
