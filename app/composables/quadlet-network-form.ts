import type { QuadletNetworkUnit } from '~/composables/use-quadlet'
import { linesToArray, linesToRecord } from '~/composables/quadlet-container-form'

export interface QuadletNetworkFormRaw {
  after: string
  requires: string
  containers_conf_modules: string
  dns: string
  gateway: string
  global_args: string
  ip_range: string
  labels: string
  options: string
  podman_args: string
  subnet: string
  wanted_by: string
}

export function createEmptyQuadletNetworkUnit(name = ''): QuadletNetworkUnit {
  return {
    name,
    description: '',
    after: [],
    requires: [],
    containers_conf_modules: [],
    disable_dns: false,
    dns: [],
    driver: '',
    gateway: [],
    global_args: [],
    interface_name: '',
    internal: false,
    ipam_driver: '',
    ip_range: [],
    ipv6: false,
    labels: {},
    network_delete_on_stop: false,
    network_name: '',
    options: [],
    podman_args: [],
    subnet: [],
    wanted_by: ['default.target'],
  }
}

export function createEmptyQuadletNetworkRaw(): QuadletNetworkFormRaw {
  return {
    after: '',
    requires: '',
    containers_conf_modules: '',
    dns: '',
    gateway: '',
    global_args: '',
    ip_range: '',
    labels: '',
    options: '',
    podman_args: '',
    subnet: '',
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

export function buildQuadletNetworkPayload(form: QuadletNetworkUnit, raw: QuadletNetworkFormRaw): QuadletNetworkUnit {
  return {
    name: form.name.trim(),
    description: form.description?.trim() || undefined,
    driver: form.driver?.trim() || undefined,
    interface_name: form.interface_name?.trim() || undefined,
    ipam_driver: form.ipam_driver?.trim() || undefined,
    network_name: form.network_name?.trim() || undefined,
    disable_dns: form.disable_dns,
    internal: form.internal,
    ipv6: form.ipv6,
    network_delete_on_stop: form.network_delete_on_stop,
    after: linesToArray(raw.after),
    requires: linesToArray(raw.requires),
    containers_conf_modules: linesToArray(raw.containers_conf_modules),
    dns: linesToArray(raw.dns),
    gateway: linesToArray(raw.gateway),
    global_args: linesToArray(raw.global_args),
    ip_range: linesToArray(raw.ip_range),
    labels: linesToRecord(raw.labels),
    options: linesToArray(raw.options),
    podman_args: linesToArray(raw.podman_args),
    subnet: linesToArray(raw.subnet),
    wanted_by: linesToArray(raw.wanted_by),
  }
}

export function parseNetworkUnitFile(content: string, fallbackName = ''): { form: QuadletNetworkUnit, raw: QuadletNetworkFormRaw } {
  const form = createEmptyQuadletNetworkUnit(fallbackName)
  const raw = createEmptyQuadletNetworkRaw()

  raw.dns = ''
  raw.gateway = ''
  raw.ip_range = ''
  raw.subnet = ''
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

    if (currentSection === 'Network') {
      if (key === 'ContainersConfModule') raw.containers_conf_modules = raw.containers_conf_modules ? `${raw.containers_conf_modules}\n${parseValue(value)}` : (parseValue(value) ?? '')
      if (key === 'DisableDNS') form.disable_dns = parseBool(value)
      if (key === 'DNS') raw.dns = raw.dns ? `${raw.dns}\n${parseValue(value)}` : (parseValue(value) ?? '')
      if (key === 'Driver') form.driver = parseValue(value)
      if (key === 'Gateway') raw.gateway = raw.gateway ? `${raw.gateway}\n${parseValue(value)}` : (parseValue(value) ?? '')
      if (key === 'GlobalArgs') raw.global_args = raw.global_args ? `${raw.global_args}\n${parseValue(value)}` : (parseValue(value) ?? '')
      if (key === 'InterfaceName') form.interface_name = parseValue(value)
      if (key === 'Internal') form.internal = parseBool(value)
      if (key === 'IPAMDriver') form.ipam_driver = parseValue(value)
      if (key === 'IPRange') raw.ip_range = raw.ip_range ? `${raw.ip_range}\n${parseValue(value)}` : (parseValue(value) ?? '')
      if (key === 'IPv6') form.ipv6 = parseBool(value)
      if (key === 'Label') raw.labels = raw.labels ? `${raw.labels}\n${parseValue(value)}` : (parseValue(value) ?? '')
      if (key === 'NetworkDeleteOnStop') form.network_delete_on_stop = parseBool(value)
      if (key === 'NetworkName') form.network_name = parseValue(value)
      if (key === 'Options') raw.options = raw.options ? `${raw.options}\n${parseValue(value)}` : (parseValue(value) ?? '')
      if (key === 'PodmanArgs') raw.podman_args = raw.podman_args ? `${raw.podman_args}\n${parseValue(value)}` : (parseValue(value) ?? '')
      if (key === 'Subnet') raw.subnet = raw.subnet ? `${raw.subnet}\n${parseValue(value)}` : (parseValue(value) ?? '')
    }

    if (currentSection === 'Install') {
      if (key === 'WantedBy') raw.wanted_by = raw.wanted_by ? `${raw.wanted_by}\n${parseValue(value)}` : (parseValue(value) ?? '')
    }
  }

  form.after = linesToArray(raw.after)
  form.requires = linesToArray(raw.requires)
  form.containers_conf_modules = linesToArray(raw.containers_conf_modules)
  form.dns = linesToArray(raw.dns)
  form.gateway = linesToArray(raw.gateway)
  form.global_args = linesToArray(raw.global_args)
  form.ip_range = linesToArray(raw.ip_range)
  form.labels = linesToRecord(raw.labels)
  form.options = linesToArray(raw.options)
  form.podman_args = linesToArray(raw.podman_args)
  form.subnet = linesToArray(raw.subnet)
  form.wanted_by = linesToArray(raw.wanted_by)

  return {
    form,
    raw: {
      after: arrayToLines(form.after),
      requires: arrayToLines(form.requires),
      containers_conf_modules: arrayToLines(form.containers_conf_modules),
      dns: arrayToLines(form.dns),
      gateway: arrayToLines(form.gateway),
      global_args: arrayToLines(form.global_args),
      ip_range: arrayToLines(form.ip_range),
      labels: recordToLines(form.labels),
      options: arrayToLines(form.options),
      podman_args: arrayToLines(form.podman_args),
      subnet: arrayToLines(form.subnet),
      wanted_by: arrayToLines(form.wanted_by?.length ? form.wanted_by : ['default.target']),
    },
  }
}
