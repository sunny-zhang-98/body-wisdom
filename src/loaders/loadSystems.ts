import type { BodySystem } from '../types'

const modules = import.meta.glob('/src/data/systems/*.json', {
  eager: true,
  import: 'default',
})

const systems = Object.values(modules) as BodySystem[]

export function getSystems(): BodySystem[] {
  return systems.sort((a, b) => a.order - b.order)
}

export function getSystemById(id: string): BodySystem | undefined {
  return systems.find(s => s.id === id)
}
