import type { QuadletImageUnit } from '~/composables/useQuadlet'
import { linesToArray } from '~/composables/quadlet-container-form'

export interface QuadletImageFormRaw {
  after: string
  requires: string
  containers_conf_modules: string
  global_args: string
  podman_args: string
  wanted_by: string
}

export function createEmptyQuadletImageUnit(name = ''): QuadletImageUnit {
  return {
    name,
    description: '',
    after: [],
    requires: [],
    all_tags: false,
    arch: '',
    auth_file: '',
    cert_dir: '',
    containers_conf_modules: [],
    creds: '',
    decryption_key: '',
    global_args: [],
    image: '',
    image_tag: '',
    os: '',
    podman_args: [],
    policy: '',
    retry: undefined,
    retry_delay: '',
    tls_verify: undefined,
    variant: '',
    wanted_by: ['default.target'],
  }
}

export function createEmptyQuadletImageRaw(): QuadletImageFormRaw {
  return {
    after: '',
    requires: '',
    containers_conf_modules: '',
    global_args: '',
    podman_args: '',
    wanted_by: 'default.target',
  }
}

function arrayToLines(values?: string[]) {
  return values?.join('\n') ?? ''
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

function parseIntValue(value: string) {
  const parsed = Number.parseInt(parseValue(value) ?? '', 10)
  return Number.isNaN(parsed) ? undefined : parsed
}

export function buildQuadletImagePayload(form: QuadletImageUnit, raw: QuadletImageFormRaw): QuadletImageUnit {
  return {
    name: form.name.trim(),
    description: form.description?.trim() || undefined,
    image: form.image.trim(),
    arch: form.arch?.trim() || undefined,
    auth_file: form.auth_file?.trim() || undefined,
    cert_dir: form.cert_dir?.trim() || undefined,
    creds: form.creds?.trim() || undefined,
    decryption_key: form.decryption_key?.trim() || undefined,
    image_tag: form.image_tag?.trim() || undefined,
    os: form.os?.trim() || undefined,
    policy: form.policy?.trim() || undefined,
    retry_delay: form.retry_delay?.trim() || undefined,
    variant: form.variant?.trim() || undefined,
    all_tags: form.all_tags,
    tls_verify: form.tls_verify,
    retry: form.retry !== undefined && form.retry !== null && !Number.isNaN(form.retry) ? form.retry : undefined,
    after: linesToArray(raw.after),
    requires: linesToArray(raw.requires),
    containers_conf_modules: linesToArray(raw.containers_conf_modules),
    global_args: linesToArray(raw.global_args),
    podman_args: linesToArray(raw.podman_args),
    wanted_by: linesToArray(raw.wanted_by),
  }
}

export function parseImageUnitFile(content: string, fallbackName = ''): { form: QuadletImageUnit, raw: QuadletImageFormRaw } {
  const form = createEmptyQuadletImageUnit(fallbackName)
  const raw = createEmptyQuadletImageRaw()

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

    if (currentSection === 'Image') {
      if (key === 'AllTags') form.all_tags = parseBool(value)
      if (key === 'Arch') form.arch = parseValue(value)
      if (key === 'AuthFile') form.auth_file = parseValue(value)
      if (key === 'CertDir') form.cert_dir = parseValue(value)
      if (key === 'ContainersConfModule') raw.containers_conf_modules = raw.containers_conf_modules ? `${raw.containers_conf_modules}\n${parseValue(value)}` : (parseValue(value) ?? '')
      if (key === 'Creds') form.creds = parseValue(value)
      if (key === 'DecryptionKey') form.decryption_key = parseValue(value)
      if (key === 'GlobalArgs') raw.global_args = raw.global_args ? `${raw.global_args}\n${parseValue(value)}` : (parseValue(value) ?? '')
      if (key === 'Image') form.image = parseValue(value) ?? ''
      if (key === 'ImageTag') form.image_tag = parseValue(value)
      if (key === 'OS') form.os = parseValue(value)
      if (key === 'PodmanArgs') raw.podman_args = raw.podman_args ? `${raw.podman_args}\n${parseValue(value)}` : (parseValue(value) ?? '')
      if (key === 'Policy') form.policy = parseValue(value)
      if (key === 'Retry') form.retry = parseIntValue(value)
      if (key === 'RetryDelay') form.retry_delay = parseValue(value)
      if (key === 'TLSVerify') form.tls_verify = parseBool(value)
      if (key === 'Variant') form.variant = parseValue(value)
    }

    if (currentSection === 'Install') {
      if (key === 'WantedBy') raw.wanted_by = raw.wanted_by ? `${raw.wanted_by}\n${parseValue(value)}` : (parseValue(value) ?? '')
    }
  }

  form.after = linesToArray(raw.after)
  form.requires = linesToArray(raw.requires)
  form.containers_conf_modules = linesToArray(raw.containers_conf_modules)
  form.global_args = linesToArray(raw.global_args)
  form.podman_args = linesToArray(raw.podman_args)
  form.wanted_by = linesToArray(raw.wanted_by)

  return {
    form,
    raw: {
      after: arrayToLines(form.after),
      requires: arrayToLines(form.requires),
      containers_conf_modules: arrayToLines(form.containers_conf_modules),
      global_args: arrayToLines(form.global_args),
      podman_args: arrayToLines(form.podman_args),
      wanted_by: arrayToLines(form.wanted_by?.length ? form.wanted_by : ['default.target']),
    },
  }
}
