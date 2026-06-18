import { useParams, useNavigate } from 'react-router-dom'
import { getOrganById } from '../loaders/loadOrgans'
import { getSystemById } from '../loaders/loadSystems'
import { getBehaviorById } from '../loaders/loadBehaviors'
import { getRelationsByOrgan } from '../loaders/loadRelations'
import { useAppState } from '../store/AppContext'
import SelfCheckCard from '../components/SelfCheckCard'
import BehaviorCard from '../components/BehaviorCard'
import DisclaimerBanner from '../components/DisclaimerBanner'
import { getOrganDamageColor } from '../utils/scoring'

export default function OrganDetail() {
  const { organId } = useParams<{ organId: string }>()
  const navigate = useNavigate()
  const { state } = useAppState()

  const organ = organId ? getOrganById(organId) : undefined
  if (!organ) {
    return (
      <div className="page">
        <div className="empty-state">未找到该器官信息</div>
      </div>
    )
  }

  const system = getSystemById(organ.systemId)
  const assessment = state.assessments[organ.id]
  const relations = getRelationsByOrgan(organ.id)

  // Split relations into beneficial and harmful
  const beneficialRels = relations.filter(r => {
    const b = getBehaviorById(r.behaviorId)
    return b?.type === 'beneficial'
  })
  const harmfulRels = relations.filter(r => {
    const b = getBehaviorById(r.behaviorId)
    return b?.type === 'harmful'
  })

  const damageColors = ['#52c41a', '#a0d911', '#faad14', '#fa8c16', '#ff4d4f', '#cf1322']
  const damageLabels = ['健康', '亚健康', '早期损伤', '中度损伤', '重度损伤', '衰竭']

  return (
    <div className="page">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
        {system && <span style={{ fontSize: 20 }}>{system.icon}</span>}
        <div>
          <h1 className="page-title" style={{ marginBottom: 0 }}>{organ.name}</h1>
          {system && (
            <span
              style={{ fontSize: 13, color: 'var(--color-text-secondary)', cursor: 'pointer' }}
              onClick={() => navigate(`/systems/${system.id}`)}
            >
              {system.name} ›
            </span>
          )}
        </div>
      </div>

      {/* Current assessment status */}
      {assessment && (
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '4px 12px',
            borderRadius: 12,
            fontSize: 13,
            fontWeight: 600,
            background: `${getOrganDamageColor(assessment.damageLevel)}20`,
            color: getOrganDamageColor(assessment.damageLevel),
            marginBottom: 8,
          }}
        >
          当前评估：{damageLabels[assessment.damageLevel]}
        </div>
      )}

      <DisclaimerBanner text="⚠️ 内容由AI生成，非专业医学建议。自测不能替代医生诊断。" />

      {/* Function */}
      <div className="detail-section">
        <div className="detail-section-title">📌 功能</div>
        <div className="detail-section-content">{organ.function}</div>
        <div className="detail-section-content" style={{ marginTop: 8, fontSize: 13, color: 'var(--color-text-secondary)' }}>
          {organ.description}
        </div>
      </div>

      <div className="section-divider" />

      {/* Early Symptoms */}
      <div className="detail-section">
        <div className="detail-section-title">⚠️ 早期症状</div>
        {organ.earlySymptoms.length > 0 ? (
          <ul className="detail-list">
            {organ.earlySymptoms.map((s, i) => <li key={i}>{s}</li>)}
          </ul>
        ) : (
          <div className="detail-section-content" style={{ color: 'var(--color-text-secondary)' }}>
            暂无数据
          </div>
        )}
      </div>

      {/* Late Diseases */}
      <div className="detail-section">
        <div className="detail-section-title">🏥 晚期病症</div>
        {organ.lateDiseases.length > 0 ? (
          <ul className="detail-list">
            {organ.lateDiseases.map((d, i) => <li key={i}>{d}</li>)}
          </ul>
        ) : (
          <div className="detail-section-content" style={{ color: 'var(--color-text-secondary)' }}>
            暂无数据
          </div>
        )}
      </div>

      <div className="section-divider" />

      {/* Self Checks */}
      {organ.selfChecks.length > 0 && (
        <>
          <div className="detail-section">
            <div className="detail-section-title">🩺 自测与排除方式</div>
            {organ.selfChecks.map((sc, i) => (
              <SelfCheckCard key={i} selfCheck={sc} />
            ))}
            <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', fontStyle: 'italic', marginTop: 4 }}>
              ⚠️ 自测方法仅供初步参考，不能替代专业医学检查和医生诊断。如有不适请及时就医。
            </div>
          </div>
          <div className="section-divider" />
        </>
      )}

      {/* Damage Levels */}
      <div className="detail-section">
        <div className="detail-section-title">📊 损害等级</div>
        <div style={{ display: 'flex', gap: 4, marginBottom: 12 }}>
          {damageColors.map((color, i) => (
            <div
              key={i}
              style={{
                flex: 1,
                height: 8,
                borderRadius: 4,
                background: color,
                opacity: assessment?.damageLevel === i ? 1 : 0.25,
                transition: 'opacity 0.3s',
              }}
            />
          ))}
        </div>
        <div className="list" style={{ gap: 6 }}>
          {organ.damageLevels.map(dl => (
            <div
              key={dl.level}
              style={{
                display: 'flex',
                gap: 8,
                padding: '6px 10px',
                borderRadius: 8,
                fontSize: 13,
                background: assessment?.damageLevel === dl.level ? `${damageColors[dl.level]}15` : 'transparent',
                border: assessment?.damageLevel === dl.level ? `1px solid ${damageColors[dl.level]}40` : '1px solid transparent',
              }}
            >
              <span style={{
                width: 20,
                height: 20,
                borderRadius: '50%',
                background: damageColors[dl.level],
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 11,
                fontWeight: 700,
                flexShrink: 0,
              }}>
                {dl.level}
              </span>
              <div>
                <strong>{dl.label}</strong>
                <span style={{ color: 'var(--color-text-secondary)', marginLeft: 4 }}>— {dl.description}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="section-divider" />

      {/* Related Behaviors - Beneficial */}
      <div className="detail-section">
        <div className="detail-section-title">✅ 有益行为</div>
        {beneficialRels.length > 0 ? (
          <div className="list">
            {beneficialRels.map(rel => {
              const behavior = getBehaviorById(rel.behaviorId)
              if (!behavior) return null
              return (
                <BehaviorCard
                  key={rel.id}
                  behavior={behavior}
                  onClick={() => navigate(`/behaviors/${behavior.id}`)}
                />
              )
            })}
          </div>
        ) : (
          <div className="empty-state" style={{ padding: 20 }}>暂无关联的有益行为</div>
        )}
      </div>

      {/* Related Behaviors - Harmful */}
      <div className="detail-section">
        <div className="detail-section-title">❌ 有害行为</div>
        {harmfulRels.length > 0 ? (
          <div className="list">
            {harmfulRels.map(rel => {
              const behavior = getBehaviorById(rel.behaviorId)
              if (!behavior) return null
              return (
                <BehaviorCard
                  key={rel.id}
                  behavior={behavior}
                  onClick={() => navigate(`/behaviors/${behavior.id}`)}
                />
              )
            })}
          </div>
        ) : (
          <div className="empty-state" style={{ padding: 20 }}>暂无关联的有害行为</div>
        )}
      </div>
    </div>
  )
}
