import { useNavigate } from 'react-router-dom'
import { useAppState } from '../store/AppContext'
import { getSystems } from '../loaders/loadSystems'
import { getOrgansBySystem, getOrgans } from '../loaders/loadOrgans'
import { getOrganDamageColor, deriveAssessments } from '../utils/scoring'

const damageLabels = ['健康', '亚健康', '早期', '中度', '重度', '衰竭']

export default function Home() {
  const navigate = useNavigate()
  const { state, dispatch } = useAppState()
  const systems = getSystems()
  const allOrgans = getOrgans()
  const assessments = deriveAssessments(allOrgans, state.selfCheckResults)
  const assessedCount = Object.keys(assessments).length
  const theme = state.theme

  // Top organs needing attention (highest damage level)
  const needsAttention = allOrgans
    .map(o => ({ organ: o, assessment: assessments[o.id] }))
    .filter(x => x.assessment && x.assessment.damageLevel >= 2)
    .sort((a, b) => b.assessment!.damageLevel - a.assessment!.damageLevel)
    .slice(0, 5)

  // Count organs at each damage level
  const levelCounts = [0, 1, 2, 3, 4, 5].map(l =>
    Object.values(assessments).filter(a => a.damageLevel === l).length
  )

  return (
    <div className="page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
        <div>
          <h1 className="page-title" style={{ marginBottom: 2 }}>🏥 人体功能模型</h1>
          <p className="page-subtitle" style={{ marginBottom: 0 }}>
            了解你的身体，量化健康行为
          </p>
        </div>
        <button
          className="theme-toggle"
          onClick={() => dispatch({ type: 'SET_THEME', theme: theme === 'light' ? 'dark' : 'light' })}
          style={{ position: 'relative', top: 0, right: 0 }}
        >
          {theme === 'light' ? '🌙' : '☀️'}
        </button>
      </div>

      {/* Stats overview */}
      <div className="grid grid-2" style={{ marginBottom: 16 }}>
        <div className="card" style={{ textAlign: 'center', padding: '12px 8px' }}
          onClick={() => navigate('/systems')}
        >
          <div style={{ fontSize: 28 }}>{allOrgans.length}</div>
          <div style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>器官/组织</div>
        </div>
        <div className="card" style={{ textAlign: 'center', padding: '12px 8px' }}
          onClick={() => navigate('/behaviors')}
        >
          <div style={{ fontSize: 28 }}>{systems.length}</div>
          <div style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>人体系统</div>
        </div>
        <div className="card" style={{ textAlign: 'center', padding: '12px 8px' }}
          onClick={() => navigate('/self-check')}
        >
          <div style={{ fontSize: 28 }}>{assessedCount}</div>
          <div style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>已评估</div>
        </div>
        <div className="card" style={{ textAlign: 'center', padding: '12px 8px' }}
          onClick={() => navigate('/recommendations')}
        >
          <div style={{ fontSize: 28 }}>{needsAttention.length}</div>
          <div style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>需关注</div>
        </div>
      </div>

      {/* Quick actions */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        <button className="btn btn-primary btn-block" onClick={() => navigate('/self-check')}
          style={{ flex: 1, textAlign: 'center' }}
          >
          🩺 开始自检
        </button>
        {assessedCount > 0 && (
          <button className="btn btn-outline" onClick={() => navigate('/recommendations')}
            style={{ flex: 1, textAlign: 'center' }}>
            💡 看推荐
          </button>
        )}
        <button className="btn btn-outline" onClick={() => navigate('/systems')}
          style={{ flex: 1, textAlign: 'center' }}>
          📋 浏览系统
        </button>
      </div>

      {/* Health distribution */}
      {assessedCount > 0 && (
        <div className="card" style={{ marginBottom: 16 }}>
          <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 8 }}>📊 健康分布</div>
          <div className="damage-bar" style={{ marginBottom: 8 }}>
            {levelCounts.map((count, level) => {
              const pct = assessedCount > 0 ? (count / assessedCount) * 100 : 0
              return (
                <div
                  key={level}
                  style={{
                    flex: count || 0.1,
                    height: 12,
                    background: getOrganDamageColor(level),
                    borderRadius: level === 0 ? '6px 0 0 6px' : level === 5 ? '0 6px 6px 0' : 0,
                    minWidth: pct < 0.1 ? 0 : undefined,
                    position: 'relative',
                  }}
                  title={`${damageLabels[level]}: ${count}个`}
                />
              )
            })}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--color-text-secondary)' }}>
            {damageLabels.map((l, i) => (
              <span key={i}>{l}({levelCounts[i]})</span>
            ))}
          </div>
        </div>
      )}

      {/* Systems quick browse */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 8 }}>🔍 快速浏览系统</div>
        <div className="grid grid-2">
          {systems.slice(0, 6).map(sys => {
            const count = getOrgansBySystem(sys.id).length
            return (
              <div
                key={sys.id}
                className="card"
                style={{ padding: '10px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}
                onClick={() => navigate(`/systems/${sys.id}`)}
              >
                <span style={{ fontSize: 22 }}>{sys.icon}</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{sys.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>{count} 个器官</div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Organs needing attention */}
      {needsAttention.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 8, color: 'var(--color-danger)' }}>
            🚨 最需要注意的器官
          </div>
          <div className="list">
            {needsAttention.map(({ organ, assessment }) => (
              <div
                key={organ.id}
                className="organ-card"
                onClick={() => navigate(`/organ/${organ.id}`)}
              >
                <div className="organ-card-info">
                  <div className="organ-card-name">{organ.name}</div>
                  <div className="organ-card-function">{organ.function}</div>
                </div>
                <span style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: getOrganDamageColor(assessment!.damageLevel),
                }}>
                  {damageLabels[assessment!.damageLevel]}
                </span>
                <span className="organ-card-arrow">›</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Disclaimer */}
      <div className="disclaimer-banner" style={{ marginTop: 8 }}>
        <span className="icon">⚠️</span>
        <span>
          内容由 AI 生成，非专业医生建议，仅供参考。如有身体不适请及时就医。
          自评结果不能替代专业医学检查。
        </span>
      </div>
    </div>
  )
}
