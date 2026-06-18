import type { Relation } from '../types'

const modules = import.meta.glob('/src/data/relations/*.json', {
  eager: true,
  import: 'default',
})

const relations = Object.values(modules) as Relation[]

export function getRelations(): Relation[] {
  return relations
}

export function getRelationsByOrgan(organId: string): Relation[] {
  return relations.filter(r => r.organId === organId)
}

export function getRelationsByBehavior(behaviorId: string): Relation[] {
  return relations.filter(r => r.behaviorId === behaviorId)
}
