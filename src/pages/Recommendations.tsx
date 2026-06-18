import { useNavigate } from 'react-router-dom'
import DisclaimerBanner from '../components/DisclaimerBanner'
import { useAppState } from '../store/AppContext'
import { getOrgans } from '../loaders/loadOrgans'
import { getBehaviors } from '../loaders/loadBehaviors'
import { getRelations } from '../loaders/loadRelations'
import { getSystems } from '../loaders/loadSystems'
import { getOrgansBySystem } from '../loaders/loadOrgans'
import { calcBeneficialScores, calcHarmfulScores, getOrganDamageColor } from '../utils/scoring'

const damageLabels = ['健康', '亚健康', '早期', '中度', '重度', '衰竭']

export default function Recommendations() {
  const navigate = useNavigate()
  const { state } = useAppState()
  const organs = getOrgans()
  const behaviors = getBehaviors()
  const relations = getRelations()
  const assessments = state.assessments
  const assessedCount = Object.keys(assessments).length

  const beneficialRecs = calcBeneficialScores(behaviors, organs, relations, assessments)
  const harmfulRecs = calcHarmfulScores(behaviors, organs, relations, assessments)

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
          <p style={{ fontSize: 16, marginBottom: 12 }}>你还没有做任何评估</p>
          <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', marginBottom: 20 }}>
            先去评估你的器官健康状况，才能获得个性化行为建议
          </p>
          <button className="btn btn-primary" onClick={() => navigate('/assessment')}>
            📊 去评估
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
          onClick={() => navigate('/assessment')}
        >
          📊 重新评估
        </button>
      </div>

      {/* Harmful behaviors to avoid */}
      {harmfulRecs.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <h2 style={{ fontSize: 17, fontWeight: 700, marginBottom: 10, color: 'var(--color-harmful)' }}>
            ⚠️ 最需要避免的行为
          </h2>
          <div className="list">
            {harmfulRecs.slice(0, 10).map((rec, i) => (
              <div
                key={rec.behavior.id}
                className="recommend-card"
                style={{ cursor: 'pointer' }}
                onClick={() => navigate(`/behaviors/${rec.behavior.id}`)}
              >
                <div className="recommend-card-header">
                  <span className="recommend-card-name">
                    {i + 1}. {rec.behavior.name}
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
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Beneficial behaviors to adopt */}
      {beneficialRecs.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <h2 style={{ fontSize: 17, fontWeight: 700, marginBottom: 10, color: 'var(--color-beneficial)' }}>
            ✅ 最值得做的行为
          </h2>
          <div className="list">
            {beneficialRecs.slice(0, 10).map((rec, i) => (
              <div
                key={rec.behavior.id}
                className="recommend-card"
                style={{ cursor: 'pointer' }}
                onClick={() => navigate(`/behaviors/${rec.behavior.id}`)}
              >
                <div className="recommend-card-header">
                  <span className="recommend-card-name">
                    {i + 1}. {rec.behavior.name}
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
              </div>
            ))}
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
