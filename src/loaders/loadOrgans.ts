import type { Organ } from '../types'

const modules = import.meta.glob('/src/data/organs/*.json', {
  eager: true,
  import: 'default',
})

const organs = Object.values(modules) as Organ[]

export function getOrgans(): Organ[] {
  return organs
}

export function getOrganById(id: string): Organ | undefined {
  return organs.find(o => o.id === id)
}

export function getOrgansBySystem(systemId: string): Organ[] {
  return organs.filter(o => o.systemId === systemId)
}

export function getSystemIdByOrganId(organId: string): string | undefined {
  return organs.find(o => o.id === organId)?.systemId
}
