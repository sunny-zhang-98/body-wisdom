import { useState } from 'react'
import DisclaimerBanner from '../components/DisclaimerBanner'
import { useAppState } from '../store/AppContext'
import { getSystems } from '../loaders/loadSystems'
import { getOrgansBySystem, getOrgans } from '../loaders/loadOrgans'
import { getOrganDamageColor } from '../utils/scoring'
import type { Organ } from '../types'

const damageLabels = ['健康', '亚健康', '早期损伤', '中度损伤', '重度损伤', '衰竭']
const damageColors = ['#52c41a', '#a0d911', '#faad14', '#fa8c16', '#ff4d4f', '#cf1322']

function DamageSlider({
  organ,
  value,
  onChange,
}: {
  organ: Organ
  value: number
  onChange: (v: number) => void
}) {
  return (
    <div className="damage-slider-wrap">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
        <span style={{ fontSize: 15, fontWeight: 600 }}>{organ.name}</span>
        <span style={{ fontSize: 13, fontWeight: 600, color: getOrganDamageColor(value) }}>
          {damageLabels[value]}
        </span>
      </div>
      <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginBottom: 6 }}>
        {organ.function}
      </div>
      <input
        type="range"
        min={0}
        max={5}
        step={1}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="damage-slider"
        style={{
          background: `linear-gradient(to right,
            ${damageColors[0]} 0%,
            ${damageColors[1]} 20%,
            ${damageColors[2]} 40%,
            ${damageColors[3]} 60%,
            ${damageColors[4]} 80%,
            ${damageColors[5]} 100%)`,
        }}
      />
      <div className="damage-slider-labels">
        {damageLabels.map((l, i) => (
          <span key={i} style={{ fontWeight: value === i ? 700 : 400 }}>{l.slice(0, 2)}</span>
        ))}
      </div>
      {value > 0 && (
        <div className="damage-slider-desc">
          {organ.damageLevels[value]?.description}
        </div>
      )}
    </div>
  )
}

export default function Assessment() {
  const { state, dispatch } = useAppState()
  const systems = getSystems()
  const allOrgans = getOrgans()
  const [saved, setSaved] = useState(false)

  const assessedCount = Object.keys(state.assessments).length

  const handleChange = (organId: string, level: number) => {
    dispatch({ type: 'SET_ASSESSMENT', organId, level })
    setSaved(false)
  }

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  // Get current value for an organ
  const getValue = (organId: string) => state.assessments[organId]?.damageLevel ?? 0

  return (
    <div className="page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title" style={{ marginBottom: 4 }}>自我评估</h1>
          <p className="page-subtitle" style={{ marginBottom: 0 }}>
            评估各器官的健康状况，获取个性化建议
          </p>
        </div>
      </div>

      <DisclaimerBanner text="⚠️ 自评结果仅供参考，不构成医学诊断。如有不适请及时就医。" />

      {/* Progress */}
      <div className="assessment-progress">
        <div className="assessment-progress-bar">
          <div
            className="assessment-progress-fill"
            style={{ width: `${(assessedCount / allOrgans.length) * 100}%` }}
          />
        </div>
        <span className="assessment-progress-text">
          {assessedCount}/{allOrgans.length}
        </span>
      </div>

      {/* Save indicator */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
        <button
          className="btn btn-primary"
          onClick={handleSave}
        >
          {saved ? '✅ 已保存' : '💾 保存评估'}
        </button>
      </div>

      {/* Organs grouped by system */}
      {systems.map(system => {
        const organs = getOrgansBySystem(system.id)
        if (organs.length === 0) return null
        const assessedInSystem = organs.filter(o => state.assessments[o.id]).length

        return (
          <div key={system.id} style={{ marginBottom: 20 }}>
            <div className="section-header">
              <span className="section-header-icon">{system.icon}</span>
              <span>{system.name}</span>
              <span style={{ fontSize: 12, color: 'var(--color-text-secondary)', fontWeight: 400 }}>
                {assessedInSystem}/{organs.length}
              </span>
            </div>
            <div className="card" style={{ padding: '12px 16px' }}>
              {organs.map((organ, i) => (
                <div key={organ.id}>
                  <DamageSlider
                    organ={organ}
                    value={getValue(organ.id)}
                    onChange={v => handleChange(organ.id, v)}
                  />
                  {i < organs.length - 1 && <div className="section-divider" />}
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
