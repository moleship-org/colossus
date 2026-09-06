type QuadletKind = 'containers' | 'networks' | 'volumes' | 'images' | 'pods' | (string & {})

type QuadletActionOptions = {
  start?: boolean
  failIfExists?: boolean
}

export type QuadletUnitInfo = {
  name: string
  kind: string
  serviceName: string
  status: string
  statusError?: unknown
}

export type QuadletCreateResponse = unknown

export interface QuadletContainerUnit {
  name: string
  description?: string
  after?: string[]
  requires?: string[]
  image: string
  exec?: string[]
  entrypoint?: string
  working_dir?: string
  user?: string
  environment?: Record<string, string>
  environment_file?: string[]
  volumes?: string[]
  publish_ports?: string[]
  networks?: string[]
  labels?: Record<string, string>
  auto_update?: string
  podman_args?: string[]
  restart?: string
  wanted_by?: string[]
}

export interface QuadletVolumeUnit {
  name: string
  description?: string
  after?: string[]
  requires?: string[]
  containers_conf_modules?: string[]
  copy?: boolean
  device?: string
  driver?: string
  group?: string
  image?: string
  type?: string
  user?: string
  global_args?: string[]
  options?: string[]
  podman_args?: string[]
  labels?: Record<string, string>
  volume_name?: string
  wanted_by?: string[]
}

export interface UseQuadletOptions<TUnit> {
  kind: QuadletKind
  encodeName?: (name: string) => string
  getName?: (unit: TUnit) => string
}

function defaultEncodeName(name: string) {
  return encodeURIComponent(name)
}

function defaultGetName<TUnit extends { name: string }>(unit: TUnit) {
  return unit.name
}

export function useQuadlet<TUnit extends { name: string }>(options: UseQuadletOptions<TUnit>) {
  const kind = options.kind
  const encodeName = options.encodeName ?? defaultEncodeName
  const getName = options.getName ?? defaultGetName<TUnit>
  const basePath = `/quadlet/${kind}`

  function byNamePath(name: string) {
    return `${basePath}/${encodeName(name)}`
  }

  async function list() {
    return await callApi<QuadletUnitInfo[]>(basePath, {
      method: 'GET',
    })
  }

  async function read(name: string) {
    return await callApi<string>(byNamePath(name), {
      method: 'GET',
      responseType: 'text',
    })
  }

  async function create(unit: TUnit, createOptions: QuadletActionOptions = {}) {
    return await callApi<QuadletCreateResponse>(basePath, {
      method: 'POST',
      body: {
        ...unit,
        ...createOptions,
      },
    })
  }

  async function remove(name: string) {
    return await callApi(byNamePath(name), {
      method: 'DELETE',
    })
  }

  async function start(name: string) {
    return await callApi(`${byNamePath(name)}/start`, {
      method: 'POST',
    })
  }

  async function stop(name: string) {
    return await callApi(`${byNamePath(name)}/stop`, {
      method: 'POST',
    })
  }

  async function restart(name: string) {
    return await callApi(`${byNamePath(name)}/restart`, {
      method: 'POST',
    })
  }

  async function status(name: string) {
    return await callApi<string>(`${byNamePath(name)}/status`, {
      method: 'GET',
      responseType: 'text',
    })
  }

  async function createAndStart(unit: TUnit, failIfExists = false) {
    return await create(unit, {
      start: true,
      failIfExists,
    })
  }

  return {
    kind,
    basePath,
    getName,
    list,
    read,
    create,
    createAndStart,
    remove,
    start,
    stop,
    restart,
    status,
  }
}

export function useQuadletContainers() {
  return useQuadlet<QuadletContainerUnit>({
    kind: 'containers',
  })
}

export function useQuadletVolumes() {
  return useQuadlet<QuadletVolumeUnit>({
    kind: 'volumes',
  })
}
