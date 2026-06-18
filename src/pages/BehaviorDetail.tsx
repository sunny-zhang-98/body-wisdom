import { useParams, useNavigate } from 'react-router-dom'
import { getBehaviorById } from '../loaders/loadBehaviors'
import { getOrganById } from '../loaders/loadOrgans'
import { getRelationsByBehavior } from '../loaders/loadRelations'
import { useAppState } from '../store/AppContext'
import DisclaimerBanner from '../components/DisclaimerBanner'
import { getOrganDamageColor } from '../utils/scoring'

export default function BehaviorDetail() {
  const { behaviorId } = useParams<{ behaviorId: string }>()
  const navigate = useNavigate()
  const { state } = useAppState()

  const behavior = behaviorId ? getBehaviorById(behaviorId) : undefined
  if (!behavior) {
    return (
      <div className="page">
        <div className="empty-state">未找到该行为信息</div>
      </div>
    )
  }

  const relations = getRelationsByBehavior(behavior.id)

  // Render impact level as stars
  const renderStars = (level: number) => '⭐'.repeat(level) + '☆'.repeat(5 - level)

  return (
    <div className="page">
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <h1 className="page-title" style={{ marginBottom: 0 }}>{behavior.name}</h1>
        <span className={`tag ${behavior.type === 'beneficial' ? 'tag-beneficial' : 'tag-harmful'}`}>
          {behavior.type === 'beneficial' ? '有益' : '有害'}
        </span>
      </div>

      <div className="behavior-tags" style={{ marginBottom: 12 }}>
        <span className="tag" style={{ background: 'var(--color-bg)', color: 'var(--color-text-secondary)', border: '1px solid var(--color-border)' }}>
          {behavior.category}
        </span>
      </div>

      <DisclaimerBanner />

      {/* Description */}
      <div className="detail-section">
        <div className="detail-section-title">📝 说明</div>
        <div className="detail-section-content">{behavior.description}</div>
      </div>

      <div className="section-divider" />

      {/* Quantification - highlight */}
      <div className="detail-section" style={{
        background: 'var(--color-bg-card)',
        borderRadius: 'var(--radius-md)',
        padding: 16,
        border: '1px solid var(--color-primary)',
        marginBottom: 20,
      }}>
        <div className="detail-section-title" style={{ color: 'var(--color-primary)' }}>⚖️ 量化说明</div>
        <div style={{ fontSize: 14, lineHeight: 1.7 }}>{behavior.quantificationNote}</div>
      </div>

      <div className="section-divider" />

      {/* Affected Organs */}
      <div className="detail-section">
        <div className="detail-section-title">🎯 影响器官</div>
        {relations.length === 0 ? (
          <div className="empty-state" style={{ padding: 20 }}>暂无关联数据</div>
        ) : (
          <div className="list">
            {relations.map(rel => {
              const organ = getOrganById(rel.organId)
              const assessment = state.assessments[rel.organId]
              if (!organ) return null
              return (
                <div
                  key={rel.id}
                  className="card"
                  style={{ cursor: 'pointer' }}
                  onClick={() => navigate(`/organ/${organ.id}`)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <span style={{ fontSize: 15, fontWeight: 600 }}>{organ.name}</span>
                    <span style={{ fontSize: 12 }}>{renderStars(rel.impactLevel)}</span>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', lineHeight: 1.5, marginBottom: 4 }}>
                    {rel.mechanism}
                  </div>
                  {assessment && (
                    <div style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                      fontSize: 11,
                      padding: '2px 8px',
                      borderRadius: 4,
                      background: `${getOrganDamageColor(assessment.damageLevel)}15`,
                      color: getOrganDamageColor(assessment.damageLevel),
                    }}>
                      你的{organ.name}：{['健康', '亚健康', '早期', '中度', '重度', '衰竭'][assessment.damageLevel]}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
