import type { Organ, Behavior, Relation, Recommendation, OrganAssessment, SelfCheckResult } from '../types'

/**
 * Get color for organ damage level (0-5)
 */
export function getOrganDamageColor(level: number): string {
  const colors = ['#52c41a', '#a0d911', '#faad14', '#fa8c16', '#ff4d4f', '#cf1322']
  return colors[level] ?? '#999'
}

/**
 * Derive organ assessments from self-check results.
 * - 正常 → damageLevel = 0 (healthy, skipped in scoring)
 * - 警示 → damageLevel = user-selected level (default 3), or inferred from multiple checks (max)
 * - 未测 → organ not assessed, skipped
 */
export function deriveAssessments(
  organs: Organ[],
  selfCheckResults: Record<string, SelfCheckResult>,
): Record<string, OrganAssessment> {
  const assessments: Record<string, OrganAssessment> = {}
  const now = new Date().toISOString()

  for (const organ of organs) {
    let maxLevel = 0
    let hasWarning = false
    let hasAny = false

    for (let i = 0; i < organ.selfChecks.length; i++) {
      const key = `${organ.id}@${i}`
      const result = selfCheckResults[key]
      if (!result) continue
      hasAny = true
      if (result.result === 'warning') {
        hasWarning = true
        const level = result.damageLevel ?? 3 // default to moderate
        if (level > maxLevel) maxLevel = level
      }
    }

    if (!hasAny) continue // not assessed

    if (hasWarning) {
      assessments[organ.id] = { damageLevel: maxLevel, updatedAt: now }
    } else {
      assessments[organ.id] = { damageLevel: 0, updatedAt: now }
    }
  }

  return assessments
}

/**
 * Calculate beneficial behavior scores based on user assessments
 */
export function calcBeneficialScores(
  behaviors: Behavior[],
  organs: Organ[],
  relations: Relation[],
  assessments: Record<string, OrganAssessment>,
): Recommendation[] {
  const results: Recommendation[] = []
  const beneficial = behaviors.filter(b => b.type === 'beneficial')

  for (const behavior of beneficial) {
    const behaviorRels = relations.filter(r => r.behaviorId === behavior.id)
    let totalScore = 0
    const targetOrgans: Recommendation['targetOrgans'] = []

    for (const rel of behaviorRels) {
      const organ = organs.find(o => o.id === rel.organId)
      const assessment = assessments[rel.organId]
      if (!organ || !assessment) continue

      const damageLevel = assessment.damageLevel
      if (damageLevel < 1) continue // skip healthy organs

      // Check if this relation is applicable for this damage level
      if (rel.bestForLevels.length > 0 && !rel.bestForLevels.includes(damageLevel)) continue

      // Urgency multiplier: higher damage = more urgent
      let urgency = 1
      if (damageLevel >= 5) urgency = 2.0
      else if (damageLevel >= 3) urgency = 1.5

      const score = damageLevel * rel.impactLevel * urgency
      totalScore += score

      targetOrgans.push({ organ, effect: rel, damageLevel })
    }

    if (targetOrgans.length > 0) {
      results.push({ behavior, score: totalScore, targetOrgans })
    }
  }

  return results.sort((a, b) => b.score - a.score)
}

/**
 * Calculate harmful behavior scores based on user assessments
 */
export function calcHarmfulScores(
  behaviors: Behavior[],
  organs: Organ[],
  relations: Relation[],
  assessments: Record<string, OrganAssessment>,
): Recommendation[] {
  const results: Recommendation[] = []
  const harmful = behaviors.filter(b => b.type === 'harmful')

  for (const behavior of harmful) {
    const behaviorRels = relations.filter(r => r.behaviorId === behavior.id)
    let totalScore = 0
    const targetOrgans: Recommendation['targetOrgans'] = []

    for (const rel of behaviorRels) {
      const organ = organs.find(o => o.id === rel.organId)
      const assessment = assessments[rel.organId]
      if (!organ || !assessment) continue

      const damageLevel = assessment.damageLevel
      if (damageLevel < 1) continue

      if (rel.bestForLevels.length > 0 && !rel.bestForLevels.includes(damageLevel)) continue

      const score = damageLevel * rel.impactLevel
      totalScore += score

      targetOrgans.push({ organ, effect: rel, damageLevel })
    }

    if (targetOrgans.length > 0) {
      results.push({ behavior, score: totalScore, targetOrgans })
    }
  }

  return results.sort((a, b) => b.score - a.score)
}
