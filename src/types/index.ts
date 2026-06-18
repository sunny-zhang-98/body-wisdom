export interface BodySystem {
  id: string
  name: string
  icon: string
  order: number
  description: string
}

export interface DamageLevelDef {
  level: 0 | 1 | 2 | 3 | 4 | 5
  label: string
  description: string
}

export interface SelfCheck {
  title: string
  method: string
  whatToObserve: string
  normalResult: string
  warningResult: string
  note: string
}

export interface Organ {
  id: string
  name: string
  systemId: string
  function: string
  description: string
  earlySymptoms: string[]
  lateDiseases: string[]
  selfChecks: SelfCheck[]
  damageLevels: DamageLevelDef[]
}

export type BehaviorType = 'beneficial' | 'harmful'

export interface Behavior {
  id: string
  name: string
  type: BehaviorType
  description: string
  quantificationNote: string
  category: string
}

export interface Relation {
  id: string
  organId: string
  behaviorId: string
  impactLevel: number
  mechanism: string
  bestForLevels: number[]
}

export interface OrganAssessment {
  damageLevel: number
  updatedAt: string
}

export interface SelfCheckResult {
  result: 'normal' | 'warning' | 'untested'
  damageLevel?: number  // 1-5, 仅在 result='warning' 时有效，用户选择的损伤程度
  updatedAt: string
}

export type BehaviorMarkStatus = 'done' | 'attention'

export interface BehaviorMark {
  status: BehaviorMarkStatus
  updatedAt: string
}

export interface AppState {
  assessments: Record<string, OrganAssessment>
  selfCheckResults: Record<string, SelfCheckResult>
  behaviorMarks: Record<string, BehaviorMark>  // keyed by behaviorId
  theme: 'light' | 'dark'
}

export type AppAction =
  | { type: 'SET_ASSESSMENT'; organId: string; level: number }
  | { type: 'RESET_ASSESSMENTS' }
  | { type: 'SET_SELF_CHECK_RESULT'; key: string; result: 'normal' | 'warning' | 'untested'; damageLevel?: number }
  | { type: 'RESET_SELF_CHECKS' }
  | { type: 'MARK_BEHAVIOR'; behaviorId: string; status: BehaviorMarkStatus | null }
  | { type: 'SET_THEME'; theme: 'light' | 'dark' }

export interface Recommendation {
  behavior: Behavior
  score: number
  targetOrgans: {
    organ: Organ
    effect: Relation
    damageLevel: number
  }[]
}
