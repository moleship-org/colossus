type PersistentStateOptions<T> = {
    serializer?: (value: T) => string
    parser?: (value: string) => T
}

function defaultSerializer<T>(value: T) {
    return JSON.stringify(value)
}

function defaultParser<T>(value: string) {
    return JSON.parse(value) as T
}

export function usePersistentState<T>(
    key: string,
    defaultValue: T | (() => T),
    options: PersistentStateOptions<T> = {},
) {
    const serializer = options.serializer ?? defaultSerializer<T>
    const parser = options.parser ?? defaultParser<T>

    const createDefaultValue = () => typeof defaultValue === 'function'
        ? (defaultValue as () => T)()
        : defaultValue

    const state = ref<T>(createDefaultValue()) as Ref<T>

    if (import.meta.client) {
        const restore = () => {
            const storedValue = window.localStorage.getItem(key)

            if (storedValue === null) {
                state.value = createDefaultValue()
                return
            }

            try {
                state.value = parser(storedValue)
            } catch {
                state.value = createDefaultValue()
            }
        }

        restore()

        watch(state, (value) => {
            window.localStorage.setItem(key, serializer(value))
        }, { deep: true })
    }

    return state
}
