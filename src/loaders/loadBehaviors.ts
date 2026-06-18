import type { Behavior } from '../types'

const modules = import.meta.glob('/src/data/behaviors/*.json', {
  eager: true,
  import: 'default',
})

const behaviors = Object.values(modules) as Behavior[]

export function getBehaviors(): Behavior[] {
  return behaviors
}

export function getBehaviorById(id: string): Behavior | undefined {
  return behaviors.find(b => b.id === id)
}

export function getBehaviorsByType(type: 'beneficial' | 'harmful'): Behavior[] {
  return behaviors.filter(b => b.type === type)
}

export function getBehaviorCategories(): string[] {
  const cats = new Set(behaviors.map(b => b.category))
  return Array.from(cats)
}
