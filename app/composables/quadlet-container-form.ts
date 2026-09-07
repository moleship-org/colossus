import type { QuadletContainerUnit } from '~/composables/use-quadlet'

export interface QuadletContainerFormRaw {
  exec: string
  after: string
  requires: string
  environment: string
  environment_file: string
  volumes: string
  publish_ports: string
  networks: string
  labels: string
  podman_args: string
  wanted_by: string
}

export function createEmptyQuadletContainerUnit(name = ''): QuadletContainerUnit {
  return {
    name,
    description: '',
    image: '',
    exec: [],
    entrypoint: '',
    working_dir: '',
    user: '',
    environment: {},
    environment_file: [],
    volumes: [],
    publish_ports: [],
    networks: [],
    labels: {},
    auto_update: '',
    podman_args: [],
    restart: 'always',
    wanted_by: ['default.target'],
    after: [],
    requires: [],
  }
}

export function createEmptyQuadletContainerRaw(): QuadletContainerFormRaw {
  return {
    exec: '',
    after: '',
    requires: '',
    environment: '',
    environment_file: '',
    volumes: '',
    publish_ports: '',
    networks: '',
    labels: '',
    podman_args: '',
    wanted_by: 'default.target',
  }
}

export function linesToArray(value: string) {
  return value
    .split('\n')
    .map(item => item.trim())
    .filter(Boolean)
}

export function linesToRecord(value: string) {
  const result: Record<string, string> = {}

  for (const line of linesToArray(value)) {
    const separatorIndex = line.indexOf('=')
    if (separatorIndex === -1) {
      throw new Error(`Invalid key=value entry: ${line}`)
    }

    const key = line.slice(0, separatorIndex).trim()
    const recordValue = line.slice(separatorIndex + 1).trim()

    if (!key) {
      throw new Error(`Invalid key=value entry: ${line}`)
    }

    result[key] = recordValue
  }

  return result
}

function arrayToLines(values?: string[]) {
  return values?.join('\n') ?? ''
}

function recordToLines(values?: Record<string, string>) {
  if (!values) {
    return ''
  }

  return Object.entries(values)
    .map(([key, value]) => `${key}=${value}`)
    .join('\n')
}

export function buildQuadletContainerPayload(form: QuadletContainerUnit, raw: QuadletContainerFormRaw): QuadletContainerUnit {
  return {
    name: form.name.trim(),
    description: form.description?.trim() || undefined,
    image: form.image.trim(),
    entrypoint: form.entrypoint?.trim() || undefined,
    working_dir: form.working_dir?.trim() || undefined,
    user: form.user?.trim() || undefined,
    auto_update: form.auto_update?.trim() || undefined,
    restart: form.restart?.trim() || undefined,
    exec: linesToArray(raw.exec),
    after: linesToArray(raw.after),
    requires: linesToArray(raw.requires),
    environment: linesToRecord(raw.environment),
    environment_file: linesToArray(raw.environment_file),
    volumes: linesToArray(raw.volumes),
    publish_ports: linesToArray(raw.publish_ports),
    networks: linesToArray(raw.networks),
    labels: linesToRecord(raw.labels),
    podman_args: linesToArray(raw.podman_args),
    wanted_by: linesToArray(raw.wanted_by),
  }
}

function parseValue(value: string) {
  const trimmed = value.trim()
  const quoted = trimmed.match(/^"(.*)"$/)
  return quoted ? quoted[1] : trimmed
}

function parseExec(value: string) {
  const args: string[] = []
  let current = ''
  let quote: '"' | "'" | null = null

  for (let index = 0; index < value.length; index += 1) {
    const char = value[index]
    if (!char) {
      continue
    }

    if ((char === '"' || char === "'") && !quote) {
      quote = char
      continue
    }

    if (quote && char === quote) {
      quote = null
      continue
    }

    if (!quote && /\s/.test(char)) {
      if (current) {
        args.push(current)
        current = ''
      }
      continue
    }

    current += char
  }

  if (current) {
    args.push(current)
  }

  return args
}

export function parseContainerUnitFile(content: string, fallbackName = ''): { form: QuadletContainerUnit, raw: QuadletContainerFormRaw } {
  const form = createEmptyQuadletContainerUnit(fallbackName)
  const raw = createEmptyQuadletContainerRaw()

  raw.exec = ''
  raw.after = ''
  raw.requires = ''
  raw.environment = ''
  raw.environment_file = ''
  raw.volumes = ''
  raw.publish_ports = ''
  raw.networks = ''
  raw.labels = ''
  raw.podman_args = ''
  raw.wanted_by = ''

  let currentSection = ''

  for (const line of content.split('\n')) {
    const trimmed = line.trim()

    if (!trimmed || trimmed.startsWith('#') || trimmed.startsWith(';')) {
      continue
    }

    const sectionMatch = trimmed.match(/^\[(.+)]$/)
    if (sectionMatch) {
      currentSection = sectionMatch[1] ?? ''
      continue
    }

    const separatorIndex = trimmed.indexOf('=')
    if (separatorIndex === -1) {
      continue
    }

    const key = trimmed.slice(0, separatorIndex).trim()
    const value = trimmed.slice(separatorIndex + 1).trim()

    if (currentSection === 'Unit') {
      if (key === 'Description') form.description = parseValue(value)
      if (key === 'After') raw.after = raw.after ? `${raw.after}\n${parseValue(value)}` : (parseValue(value) ?? '')
      if (key === 'Requires') raw.requires = raw.requires ? `${raw.requires}\n${parseValue(value)}` : (parseValue(value) ?? '')
    }

    if (currentSection === 'Container') {
      if (key === 'Image') form.image = parseValue(value) ?? ''
      if (key === 'Exec') raw.exec = parseExec(value).join('\n')
      if (key === 'Entrypoint') form.entrypoint = parseValue(value)
      if (key === 'WorkingDir') form.working_dir = parseValue(value)
      if (key === 'User') form.user = parseValue(value)
      if (key === 'Environment') raw.environment = raw.environment ? `${raw.environment}\n${parseValue(value)}` : (parseValue(value) ?? '')
      if (key === 'EnvironmentFile') raw.environment_file = raw.environment_file ? `${raw.environment_file}\n${parseValue(value)}` : (parseValue(value) ?? '')
      if (key === 'Volume') raw.volumes = raw.volumes ? `${raw.volumes}\n${parseValue(value)}` : (parseValue(value) ?? '')
      if (key === 'PublishPort') raw.publish_ports = raw.publish_ports ? `${raw.publish_ports}\n${parseValue(value)}` : (parseValue(value) ?? '')
      if (key === 'Network') raw.networks = raw.networks ? `${raw.networks}\n${parseValue(value)}` : (parseValue(value) ?? '')
      if (key === 'Label') raw.labels = raw.labels ? `${raw.labels}\n${parseValue(value)}` : (parseValue(value) ?? '')
      if (key === 'AutoUpdate') form.auto_update = parseValue(value)
      if (key === 'PodmanArgs') raw.podman_args = raw.podman_args ? `${raw.podman_args}\n${parseValue(value)}` : (parseValue(value) ?? '')
    }

    if (currentSection === 'Service') {
      if (key === 'Restart') form.restart = parseValue(value)
    }

    if (currentSection === 'Install') {
      if (key === 'WantedBy') raw.wanted_by = raw.wanted_by ? `${raw.wanted_by}\n${parseValue(value)}` : (parseValue(value) ?? '')
    }
  }

  form.exec = linesToArray(raw.exec)
  form.after = linesToArray(raw.after)
  form.requires = linesToArray(raw.requires)
  form.environment = linesToRecord(raw.environment)
  form.environment_file = linesToArray(raw.environment_file)
  form.volumes = linesToArray(raw.volumes)
  form.publish_ports = linesToArray(raw.publish_ports)
  form.networks = linesToArray(raw.networks)
  form.labels = linesToRecord(raw.labels)
  form.podman_args = linesToArray(raw.podman_args)
  form.wanted_by = linesToArray(raw.wanted_by)

  return { form, raw: {
    exec: arrayToLines(form.exec),
    after: arrayToLines(form.after),
    requires: arrayToLines(form.requires),
    environment: recordToLines(form.environment),
    environment_file: arrayToLines(form.environment_file),
    volumes: arrayToLines(form.volumes),
    publish_ports: arrayToLines(form.publish_ports),
    networks: arrayToLines(form.networks),
    labels: recordToLines(form.labels),
    podman_args: arrayToLines(form.podman_args),
    wanted_by: arrayToLines(form.wanted_by?.length ? form.wanted_by : ['default.target']),
  } }
}
