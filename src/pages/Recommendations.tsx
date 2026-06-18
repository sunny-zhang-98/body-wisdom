import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import DisclaimerBanner from '../components/DisclaimerBanner'
import { useAppState } from '../store/AppContext'
import { getOrgans } from '../loaders/loadOrgans'
import { getBehaviors } from '../loaders/loadBehaviors'
import { getRelations } from '../loaders/loadRelations'
import { getSystems } from '../loaders/loadSystems'
import { getOrgansBySystem } from '../loaders/loadOrgans'
import { calcBeneficialScores, calcHarmfulScores, getOrganDamageColor, deriveAssessments } from '../utils/scoring'
import type { BehaviorMarkStatus } from '../types'

const damageLabels = ['健康', '亚健康', '早期', '中度', '重度', '衰竭']

export default function Recommendations() {
  const navigate = useNavigate()
  const { state, dispatch } = useAppState()
  const organs = getOrgans()
  const behaviors = getBehaviors()
  const relations = getRelations()
  const assessments = deriveAssessments(organs, state.selfCheckResults)
  const assessedCount = Object.keys(assessments).length

  const beneficialRecs = calcBeneficialScores(behaviors, organs, relations, assessments)
  const harmfulRecs = calcHarmfulScores(behaviors, organs, relations, assessments)
  const behaviorMarks = state.behaviorMarks

  // Mark filter state
  type MarkFilter = 'all' | 'done' | 'attention' | 'unmarked'
  const [markFilter, setMarkFilter] = useState<MarkFilter>('all')

  // Count marks across displayed recs
  const allRecBehaviorIds = [
    ...harmfulRecs.slice(0, 10).map(r => r.behavior.id),
    ...beneficialRecs.slice(0, 10).map(r => r.behavior.id),
  ]

  function getMarkCount(status: 'done' | 'attention'): number {
    return allRecBehaviorIds.filter(id => behaviorMarks[id]?.status === status).length
  }

  function getUnmarkedCount(): number {
    return allRecBehaviorIds.filter(id => !behaviorMarks[id]).length
  }

  function filterRecs<T extends { behavior: { id: string } }>(recs: T[]): T[] {
    if (markFilter === 'all') return recs
    if (markFilter === 'unmarked') return recs.filter(r => !behaviorMarks[r.behavior.id])
    return recs.filter(r => behaviorMarks[r.behavior.id]?.status === markFilter)
  }

  const filteredHarmful = filterRecs(harmfulRecs.slice(0, 10))
  const filteredBeneficial = filterRecs(beneficialRecs.slice(0, 10))

  const doneCount = getMarkCount('done')
  const attentionCount = getMarkCount('attention')
  const unmarkedCount = getUnmarkedCount()

  function handleMark(behaviorId: string, status: BehaviorMarkStatus | null) {
    dispatch({ type: 'MARK_BEHAVIOR', behaviorId, status })
  }

  // Organ health overview
  const getSystemHealth = () => {
    const systems = getSystems()
    return systems.map(sys => {
      const sysOrgans = getOrgansBySystem(sys.id)
      const assessed = sysOrgans.filter(o => assessments[o.id])
      const avgDamage = assessed.length
        ? assessed.reduce((sum, o) => sum + assessments[o.id].damageLevel, 0) / assessed.length
        : -1
      return { ...sys, avgDamage, assessedCount: assessed.length, totalCount: sysOrgans.length }
    }).filter(s => s.assessedCount > 0)
  }

  const systemHealth = getSystemHealth()

  if (assessedCount === 0) {
    return (
      <div className="page">
        <h1 className="page-title">个性化推荐</h1>
        <DisclaimerBanner />
        <div className="empty-state" style={{ padding: 40 }}>
          <p style={{ fontSize: 16, marginBottom: 12 }}>还没有完成任何自检</p>
          <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', marginBottom: 20 }}>
            先去完成器官自检，系统会根据结果自动生成个性化建议
          </p>
          <button className="btn btn-primary" onClick={() => navigate('/self-check')}>
            🩺 去自检
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="page">
      <h1 className="page-title">个性化推荐</h1>
      <DisclaimerBanner text="⚠️ 以下建议基于你的自评结果由 AI 生成，仅供参考，不构成医疗建议。请咨询专业医生。" />

      {/* Summary */}
      <div className="card" style={{ marginBottom: 16, textAlign: 'center' }}>
        <div style={{ fontSize: 14, color: 'var(--color-text-secondary)', marginBottom: 4 }}>
          已评估 {assessedCount} 个器官
        </div>
        <div style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>
          评估时间：{Object.values(assessments).sort((a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          )[0]?.updatedAt.slice(0, 10) || '-'}
        </div>
        <button
          className="btn btn-outline"
          style={{ marginTop: 10, fontSize: 12, padding: '6px 16px' }}
          onClick={() => navigate('/self-check')}
        >
          🩺 去自检
        </button>
      </div>

      {/* Mark filter bar */}
      <div className="self-check-toolbar" style={{ marginBottom: 12 }}>
        <div className="filter-bar">
          {([
            { key: 'all' as MarkFilter, label: '全部' },
            { key: 'done' as MarkFilter, label: '✅ 已做到', count: doneCount },
            { key: 'attention' as MarkFilter, label: '⚠️ 需注意', count: attentionCount },
            { key: 'unmarked' as MarkFilter, label: '◻️ 未标记', count: unmarkedCount },
          ]).map(opt => (
            <button
              key={opt.key}
              className={`filter-btn${markFilter === opt.key ? ' filter-btn--active' : ''}`}
              onClick={() => setMarkFilter(opt.key)}
            >
              {opt.label}
              {opt.count != null && (
                <span className="filter-count">{opt.count}</span>
              )}
            </button>
          ))}
        </div>
        {doneCount + attentionCount > 0 && (
          <button
            className="btn-reset"
            onClick={() => {
              allRecBehaviorIds.forEach(id => {
                dispatch({ type: 'MARK_BEHAVIOR', behaviorId: id, status: null })
              })
            }}
            style={{ fontSize: 11, padding: '4px 8px', whiteSpace: 'nowrap' }}
          >
            清除标记
          </button>
        )}
      </div>

      {/* Harmful behaviors to avoid */}
      {filteredHarmful.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <h2 style={{ fontSize: 17, fontWeight: 700, marginBottom: 10, color: 'var(--color-harmful)' }}>
            ⚠️ 最需要避免的行为
          </h2>
          <div className="list">
            {filteredHarmful.map((rec) => {
              const mark = behaviorMarks[rec.behavior.id]?.status
              return (
              <div
                key={rec.behavior.id}
                className="recommend-card"
                style={{ cursor: 'pointer', opacity: mark === 'done' ? 0.55 : 1 }}
                onClick={() => navigate(`/behaviors/${rec.behavior.id}`)}
              >
                <div className="recommend-card-header">
                  <span className="recommend-card-name">
                    {rec.behavior.name}
                    {mark === 'done' && <span className="rec-mark-label" style={{ color: 'var(--color-beneficial)' }}> ✅ 已做到</span>}
                    {mark === 'attention' && <span className="rec-mark-label" style={{ color: 'var(--color-harmful)' }}> ⚠️ 需注意</span>}
                  </span>
                  <span className="recommend-card-score">
                    紧迫度 {rec.score.toFixed(0)}
                  </span>
                </div>
                <div className="recommend-card-organs">
                  {rec.targetOrgans.map(to => (
                    <span
                      key={to.organ.id}
                      className="recommend-card-organ-tag"
                      style={{ border: `1px solid ${getOrganDamageColor(to.damageLevel)}40` }}
                      onClick={e => { e.stopPropagation(); navigate(`/organ/${to.organ.id}`) }}
                    >
                      {to.organ.name} {damageLabels[to.damageLevel]}
                    </span>
                  ))}
                </div>
                <div className="recommend-card-reason">
                  你的 {rec.targetOrgans.map(t => t.organ.name).join('、')} 已有损伤，继续 {rec.behavior.name} 会加剧这些器官的恶化
                </div>
                {/* Mark buttons */}
                <div className="recommend-card-marks" onClick={e => e.stopPropagation()}>
                  <button
                    className={`mark-btn mark-btn--done${mark === 'done' ? ' active' : ''}`}
                    onClick={() => handleMark(rec.behavior.id, mark === 'done' ? null : 'done')}
                  >
                    ✅ 已做到
                  </button>
                  <button
                    className={`mark-btn mark-btn--attention${mark === 'attention' ? ' active' : ''}`}
                    onClick={() => handleMark(rec.behavior.id, mark === 'attention' ? null : 'attention')}
                  >
                    ⚠️ 需注意
                  </button>
                </div>
              </div>
            )})}
          </div>
        </div>
      )}
      {filteredHarmful.length === 0 && harmfulRecs.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <h2 style={{ fontSize: 17, fontWeight: 700, marginBottom: 10, color: 'var(--color-text-secondary)' }}>
            ⚠️ 最需要避免的行为
          </h2>
          <div className="empty-state" style={{ padding: 20 }}>
            当前筛选条件下没有需要避免的行为
          </div>
        </div>
      )}

      {/* Beneficial behaviors to adopt */}
      {filteredBeneficial.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <h2 style={{ fontSize: 17, fontWeight: 700, marginBottom: 10, color: 'var(--color-beneficial)' }}>
            ✅ 最值得做的行为
          </h2>
          <div className="list">
            {filteredBeneficial.map((rec) => {
              const mark = behaviorMarks[rec.behavior.id]?.status
              return (
              <div
                key={rec.behavior.id}
                className="recommend-card"
                style={{ cursor: 'pointer', opacity: mark === 'done' ? 0.55 : 1 }}
                onClick={() => navigate(`/behaviors/${rec.behavior.id}`)}
              >
                <div className="recommend-card-header">
                  <span className="recommend-card-name">
                    {rec.behavior.name}
                    {mark === 'done' && <span className="rec-mark-label" style={{ color: 'var(--color-beneficial)' }}> ✅ 已做到</span>}
                    {mark === 'attention' && <span className="rec-mark-label" style={{ color: 'var(--color-harmful)' }}> ⚠️ 需注意</span>}
                  </span>
                  <span className="recommend-card-score">
                    推荐度 {rec.score.toFixed(0)}
                  </span>
                </div>
                <div className="recommend-card-organs">
                  {rec.targetOrgans.map(to => (
                    <span
                      key={to.organ.id}
                      className="recommend-card-organ-tag"
                      style={{ border: `1px solid ${getOrganDamageColor(to.damageLevel)}40` }}
                      onClick={e => { e.stopPropagation(); navigate(`/organ/${to.organ.id}`) }}
                    >
                      {to.organ.name} {damageLabels[to.damageLevel]}
                    </span>
                  ))}
                </div>
                <div className="recommend-card-reason">
                  针对你受損的 {rec.targetOrgans.map(t => t.organ.name).join('、')}，{rec.behavior.name} 有助于改善和修复
                </div>
                <div style={{
                  marginTop: 8,
                  padding: '6px 10px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--color-bg)',
                  fontSize: 12,
                  color: 'var(--color-text-secondary)',
                }}>
                  ⚖️ {rec.behavior.quantificationNote}
                </div>
                {/* Mark buttons */}
                <div className="recommend-card-marks" onClick={e => e.stopPropagation()}>
                  <button
                    className={`mark-btn mark-btn--done${mark === 'done' ? ' active' : ''}`}
                    onClick={() => handleMark(rec.behavior.id, mark === 'done' ? null : 'done')}
                  >
                    ✅ 已做到
                  </button>
                  <button
                    className={`mark-btn mark-btn--attention${mark === 'attention' ? ' active' : ''}`}
                    onClick={() => handleMark(rec.behavior.id, mark === 'attention' ? null : 'attention')}
                  >
                    ⚠️ 需注意
                  </button>
                </div>
              </div>
            )})}
          </div>
        </div>
      )}
      {filteredBeneficial.length === 0 && beneficialRecs.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <h2 style={{ fontSize: 17, fontWeight: 700, marginBottom: 10, color: 'var(--color-text-secondary)' }}>
            ✅ 最值得做的行为
          </h2>
          <div className="empty-state" style={{ padding: 20 }}>
            当前筛选条件下没有值得推荐的行为
          </div>
        </div>
      )}

      {/* Organ Health Overview */}
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 17, fontWeight: 700, marginBottom: 10 }}>📊 器官健康总览</h2>
        <div className="list">
          {systemHealth.map(sys => (
            <div key={sys.id} className="card">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <span>{sys.icon}</span>
                <span style={{ fontWeight: 600 }}>{sys.name}</span>
                <span style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>
                  {sys.assessedCount}/{sys.totalCount}
                </span>
              </div>
              {sys.avgDamage >= 0 && (
                <div className="damage-bar">
                  {[0, 1, 2, 3, 4, 5].map(level => (
                    <div
                      key={level}
                      className={`damage-bar-segment ${Math.round(sys.avgDamage) >= level ? 'active' : 'inactive'}`}
                      style={{
                        background: getOrganDamageColor(level),
                        opacity: Math.round(sys.avgDamage) >= level ? 1 : 0.15,
                      }}
                    />
                  ))}
                </div>
              )}
              <div style={{
                fontSize: 12,
                color: getOrganDamageColor(Math.round(sys.avgDamage)),
                fontWeight: 600,
                marginTop: 4,
              }}>
                平均 {damageLabels[Math.round(sys.avgDamage)]}
                {sys.avgDamage < 1 ? ' 🎉' : sys.avgDamage < 2 ? ' 👀' : sys.avgDamage < 3 ? ' ⚠️' : ' 🚨'}
              </div>
            </div>
          ))}
          {systemHealth.length === 0 && (
            <div className="empty-state">暂无评估数据</div>
          )}
        </div>
      </div>
    </div>
  )
}
