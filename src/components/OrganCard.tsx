import { useNavigate } from 'react-router-dom'
import { useAppState } from '../store/AppContext'
import type { Organ } from '../types'
import { getOrganDamageColor } from '../utils/scoring'

interface Props {
  organ: Organ
}

export default function OrganCard({ organ }: Props) {
  const navigate = useNavigate()
  const { state } = useAppState()
  const assessment = state.assessments[organ.id]
  const damageLevel = assessment?.damageLevel ?? -1

  return (
    <div className="organ-card" onClick={() => navigate(`/organ/${organ.id}`)}>
      <div className="organ-card-info">
        <div className="organ-card-name">{organ.name}</div>
        <div className="organ-card-function">{organ.function}</div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {damageLevel >= 0 && (
          <span
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: getOrganDamageColor(damageLevel),
            }}
          >
            {['健康', '亚健康', '早期', '中度', '重度', '衰竭'][damageLevel]}
          </span>
        )}
        <span className="organ-card-arrow">›</span>
      </div>
    </div>
  )
}
