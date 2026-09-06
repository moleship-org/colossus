import type { QuadletVolumeUnit } from '~/composables/useQuadlet'
import { linesToArray, linesToRecord } from '~/composables/quadlet-container-form'

export interface QuadletVolumeFormRaw {
  after: string
  requires: string
  containers_conf_modules: string
  global_args: string
  options: string
  podman_args: string
  labels: string
  wanted_by: string
}

export function createEmptyQuadletVolumeUnit(name = ''): QuadletVolumeUnit {
  return {
    name,
    description: '',
    after: [],
    requires: [],
    containers_conf_modules: [],
    copy: true,
    device: '',
    driver: '',
    group: '',
    image: '',
    type: '',
    user: '',
    global_args: [],
    options: [],
    podman_args: [],
    labels: {},
    volume_name: '',
    wanted_by: ['default.target'],
  }
}

export function createEmptyQuadletVolumeRaw(): QuadletVolumeFormRaw {
  return {
    after: '',
    requires: '',
    containers_conf_modules: '',
    global_args: '',
    options: '',
    podman_args: '',
    labels: '',
    wanted_by: 'default.target',
  }
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

function parseValue(value: string) {
  const trimmed = value.trim()
  const quoted = trimmed.match(/^"(.*)"$/)
  return quoted ? quoted[1] : trimmed
}

function parseBool(value: string) {
  const normalized = (parseValue(value) ?? '').toLowerCase()
  if (normalized === 'true') {
    return true
  }
  if (normalized === 'false') {
    return false
  }
  return undefined
}

export function buildQuadletVolumePayload(form: QuadletVolumeUnit, raw: QuadletVolumeFormRaw): QuadletVolumeUnit {
  return {
    name: form.name.trim(),
    description: form.description?.trim() || undefined,
    device: form.device?.trim() || undefined,
    driver: form.driver?.trim() || undefined,
    group: form.group?.trim() || undefined,
    image: form.image?.trim() || undefined,
    type: form.type?.trim() || undefined,
    user: form.user?.trim() || undefined,
    volume_name: form.volume_name?.trim() || undefined,
    copy: form.copy,
    after: linesToArray(raw.after),
    requires: linesToArray(raw.requires),
    containers_conf_modules: linesToArray(raw.containers_conf_modules),
    global_args: linesToArray(raw.global_args),
    options: linesToArray(raw.options),
    podman_args: linesToArray(raw.podman_args),
    labels: linesToRecord(raw.labels),
    wanted_by: linesToArray(raw.wanted_by),
  }
}

export function parseVolumeUnitFile(content: string, fallbackName = ''): { form: QuadletVolumeUnit, raw: QuadletVolumeFormRaw } {
  const form = createEmptyQuadletVolumeUnit(fallbackName)
  const raw = createEmptyQuadletVolumeRaw()

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

    if (currentSection === 'Volume') {
      if (key === 'ContainersConfModule') raw.containers_conf_modules = raw.containers_conf_modules ? `${raw.containers_conf_modules}\n${parseValue(value)}` : (parseValue(value) ?? '')
      if (key === 'Copy') form.copy = parseBool(value)
      if (key === 'Device') form.device = parseValue(value)
      if (key === 'Driver') form.driver = parseValue(value)
      if (key === 'GlobalArgs') raw.global_args = raw.global_args ? `${raw.global_args}\n${parseValue(value)}` : (parseValue(value) ?? '')
      if (key === 'Group') form.group = parseValue(value)
      if (key === 'Image') form.image = parseValue(value)
      if (key === 'Label') raw.labels = raw.labels ? `${raw.labels}\n${parseValue(value)}` : (parseValue(value) ?? '')
      if (key === 'Options') raw.options = raw.options ? `${raw.options}\n${parseValue(value)}` : (parseValue(value) ?? '')
      if (key === 'PodmanArgs') raw.podman_args = raw.podman_args ? `${raw.podman_args}\n${parseValue(value)}` : (parseValue(value) ?? '')
      if (key === 'Type') form.type = parseValue(value)
      if (key === 'User') form.user = parseValue(value)
      if (key === 'VolumeName') form.volume_name = parseValue(value)
    }

    if (currentSection === 'Install') {
      if (key === 'WantedBy') raw.wanted_by = raw.wanted_by ? `${raw.wanted_by}\n${parseValue(value)}` : (parseValue(value) ?? '')
    }
  }

  form.after = linesToArray(raw.after)
  form.requires = linesToArray(raw.requires)
  form.containers_conf_modules = linesToArray(raw.containers_conf_modules)
  form.global_args = linesToArray(raw.global_args)
  form.options = linesToArray(raw.options)
  form.podman_args = linesToArray(raw.podman_args)
  form.labels = linesToRecord(raw.labels)
  form.wanted_by = linesToArray(raw.wanted_by)

  return {
    form,
    raw: {
      after: arrayToLines(form.after),
      requires: arrayToLines(form.requires),
      containers_conf_modules: arrayToLines(form.containers_conf_modules),
      global_args: arrayToLines(form.global_args),
      options: arrayToLines(form.options),
      podman_args: arrayToLines(form.podman_args),
      labels: recordToLines(form.labels),
      wanted_by: arrayToLines(form.wanted_by?.length ? form.wanted_by : ['default.target']),
    },
  }
}
