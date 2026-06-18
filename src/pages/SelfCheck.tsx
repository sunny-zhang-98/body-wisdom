import { useState, useCallback } from 'react'
import { useAppState } from '../store/AppContext'
import { getSystems } from '../loaders/loadSystems'
import { getOrgansBySystem } from '../loaders/loadOrgans'
import type { Organ, SelfCheck } from '../types'

type ResultType = 'normal' | 'warning' | 'untested'
type FilterMode = 'all' | 'untested' | 'warning'

function getCheckKey(organId: string, index: number): string {
  return `${organId}@${index}`
}

function getSelfCheckSummary(
  organs: Organ[],
  results: Record<string, { result: ResultType; updatedAt: string }>,
) {
  let total = 0
  let normal = 0
  let warning = 0
  let done = 0

  for (const organ of organs) {
    for (let i = 0; i < organ.selfChecks.length; i++) {
      total++
      const key = getCheckKey(organ.id, i)
      const r = results[key]
      if (r?.result === 'normal') {
        normal++
        done++
      } else if (r?.result === 'warning') {
        warning++
        done++
      }
    }
  }

  return { total, normal, warning, untested: total - done, done }
}

function CheckResultButton({
  result,
  current,
  onClick,
  label,
}: {
  result: ResultType
  current: ResultType
  onClick: () => void
  label: string
}) {
  const isActive = current === result
  const emoji = result === 'normal' ? '✅' : result === 'warning' ? '⚠️' : '◻️'
  return (
    <button
      className={`check-btn check-btn--${result}${isActive ? ' check-btn--active' : ''}`}
      onClick={onClick}
    >
      {emoji} {label}
    </button>
  )
}

function SelfCheckItem({
  check,
  organId,
  index,
  currentResult,
  onSetResult,
}: {
  check: SelfCheck
  organId: string
  index: number
  currentResult: ResultType
  onSetResult: (key: string, result: 'normal' | 'warning' | 'untested') => void
}) {
  const key = getCheckKey(organId, index)

  return (
    <div className="self-check-item">
      <div className="self-check-item-header">
        <span className="self-check-item-num">#{index + 1}</span>
        <strong>{check.title}</strong>
      </div>

      <div className="self-check-item-detail">
        <div className="check-detail-row">
          <span className="check-detail-label">操作方法</span>
          <span>{check.method}</span>
        </div>
        <div className="check-detail-row">
          <span className="check-detail-label">观察指标</span>
          <span>{check.whatToObserve}</span>
        </div>
        <div className="check-result-row">
          <span className="check-result-normal">✅ 正常：{check.normalResult}</span>
          <span className="check-result-warning">⚠️ 警示：{check.warningResult}</span>
        </div>
        {check.note && (
          <div className="check-detail-note">📌 {check.note}</div>
        )}
      </div>

      <div className="check-btn-group">
        <CheckResultButton
          result="normal"
          current={currentResult}
          onClick={() => onSetResult(key, 'normal')}
          label="正常"
        />
        <CheckResultButton
          result="warning"
          current={currentResult}
          onClick={() => onSetResult(key, 'warning')}
          label="警示"
        />
        <CheckResultButton
          result="untested"
          current={currentResult}
          onClick={() => onSetResult(key, 'untested')}
          label="未测"
        />
      </div>
    </div>
  )
}

function FilterBar({
  filter,
  onChange,
  warningCount,
  untestedCount,
}: {
  filter: FilterMode
  onChange: (f: FilterMode) => void
  warningCount: number
  untestedCount: number
}) {
  const options: { key: FilterMode; label: string; count?: number }[] = [
    { key: 'all', label: '全部' },
    { key: 'untested', label: '未测', count: untestedCount },
    { key: 'warning', label: '警示', count: warningCount },
  ]

  return (
    <div className="filter-bar">
      {options.map(opt => (
        <button
          key={opt.key}
          className={`filter-btn${filter === opt.key ? ' filter-btn--active' : ''}`}
          onClick={() => onChange(opt.key)}
        >
          {opt.label}
          {opt.count != null && opt.count > 0 && (
            <span className="filter-count">{opt.count}</span>
          )}
        </button>
      ))}
    </div>
  )
}

export default function SelfCheck() {
  const { state, dispatch } = useAppState()
  const [filter, setFilter] = useState<FilterMode>('all')

  const systems = getSystems().filter(s =>
    getOrgansBySystem(s.id).some(o => o.selfChecks.length > 0),
  )

  const organsWithChecks = systems.flatMap(s => getOrgansBySystem(s.id))
  const summary = getSelfCheckSummary(organsWithChecks, state.selfCheckResults)
  const pct = summary.total > 0 ? Math.round((summary.done / summary.total) * 100) : 0

  function handleToggle(key: string, result: 'normal' | 'warning' | 'untested') {
    const current = state.selfCheckResults[key]
    if (result === 'untested') {
      dispatch({ type: 'SET_SELF_CHECK_RESULT', key, result: 'untested' })
    } else if (current?.result === result) {
      dispatch({ type: 'SET_SELF_CHECK_RESULT', key, result: 'untested' })
    } else {
      dispatch({ type: 'SET_SELF_CHECK_RESULT', key, result })
    }
  }

  function getCurrentResult(organId: string, index: number): ResultType {
    const key = getCheckKey(organId, index)
    return state.selfCheckResults[key]?.result ?? 'untested'
  }

  function handleReset() {
    dispatch({ type: 'RESET_SELF_CHECKS' })
  }

  function getOrganDone(organ: Organ): number {
    return organ.selfChecks.filter((_, i) => {
      const r = state.selfCheckResults[getCheckKey(organ.id, i)]
      return r != null
    }).length
  }

  function shouldShowCheck(organId: string, index: number): boolean {
    if (filter === 'all') return true
    const result = getCurrentResult(organId, index)
    return result === filter
  }

  function shouldShowOrgan(organ: Organ): boolean {
    if (filter === 'all') return true
    return organ.selfChecks.some((_, i) => shouldShowCheck(organ.id, i))
  }

  function shouldShowSystem(systemId: string): boolean {
    if (filter === 'all') return true
    const organs = getOrgansBySystem(systemId).filter(o => o.selfChecks.length > 0)
    return organs.some(o => shouldShowOrgan(o))
  }

  // ── 复制问题清单 ──
  const copyProblemList = useCallback(() => {
    const lines: string[] = []
    const now = new Date()
    lines.push('🩺 自检问题清单')
    lines.push(`生成时间：${now.toLocaleString('zh-CN')}`)
    lines.push('')

    const hasWarning = summary.warning > 0
    const hasUntested = summary.untested > 0

    if (hasWarning) {
      lines.push('═'.repeat(30))
      lines.push('⚠️ 警示项目')
      lines.push('')
      for (const system of systems) {
        if (!shouldShowSystem(system.id)) continue
        const organs = getOrgansBySystem(system.id).filter(
          o => o.selfChecks.length > 0 && o.selfChecks.some((_, i) => getCurrentResult(o.id, i) === 'warning'),
        )
        if (organs.length === 0) continue
        lines.push(`【${system.icon} ${system.name}】`)
        for (const organ of organs) {
          for (let i = 0; i < organ.selfChecks.length; i++) {
            if (getCurrentResult(organ.id, i) !== 'warning') continue
            const c = organ.selfChecks[i]
            lines.push(`  ⚠️ ${organ.name} · ${c.title}`)
            lines.push(`    警示标准：${c.warningResult}`)
          }
        }
        lines.push('')
      }
    }

    if (hasUntested) {
      lines.push('═'.repeat(30))
      lines.push('◻️ 未测项目')
      lines.push('')
      for (const system of systems) {
        const organs = getOrgansBySystem(system.id).filter(
          o => o.selfChecks.length > 0 && o.selfChecks.some((_, i) => getCurrentResult(o.id, i) === 'untested'),
        )
        if (organs.length === 0) continue
        lines.push(`【${system.icon} ${system.name}】`)
        for (const organ of organs) {
          for (let i = 0; i < organ.selfChecks.length; i++) {
            if (getCurrentResult(organ.id, i) !== 'untested') continue
            const c = organ.selfChecks[i]
            lines.push(`  ◻️ ${organ.name} · ${c.title}`)
          }
        }
        lines.push('')
      }
    }

    lines.push('═'.repeat(30))
    lines.push('📌 自测结果仅作参考，不能替代专业医疗诊断。')

    const text = lines.join('\n')

    navigator.clipboard.writeText(text).catch(() => {
      // fallback: select from a temp element
      const ta = document.createElement('textarea')
      ta.value = text
      ta.style.position = 'fixed'
      ta.style.left = '-9999px'
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
    })
  }, [systems, summary, state.selfCheckResults])

  return (
    <div className="page page-self-check">
      <div className="page-header">
        <h1>🩺 简易自检</h1>
        <p className="page-subtitle">按系统完成所有自测项目，了解身体各器官健康状态</p>
      </div>

      {/* 全局进度 */}
      <div className="self-check-progress">
        <div className="self-check-progress-header">
          <span>自测进度</span>
          <span className="self-check-progress-count">
            {summary.done}/{summary.total} 项完成
          </span>
        </div>
        <div className="self-check-progress-bar">
          <div className="self-check-progress-fill" style={{ width: `${pct}%` }} />
        </div>
        <div className="self-check-progress-labels">
          <span className="label-normal">✅ 正常 {summary.normal}</span>
          <span className="label-warning">⚠️ 警示 {summary.warning}</span>
          {summary.untested > 0 && (
            <span className="label-untested">◻️ 未测 {summary.untested}</span>
          )}
          {summary.done > 0 && (
            <button className="btn-reset" onClick={handleReset}>
              重置全部
            </button>
          )}
        </div>
      </div>

      {/* 筛选 + 复制 */}
      <div className="self-check-toolbar">
        <FilterBar
          filter={filter}
          onChange={setFilter}
          warningCount={summary.warning}
          untestedCount={summary.untested}
        />
        <button
          className="btn-copy"
          onClick={copyProblemList}
          disabled={summary.warning === 0 && summary.untested === 0}
        >
          📋 复制问题清单
        </button>
      </div>

      {/* 免责声明 */}
      <div className="self-check-disclaimer">
        ⚠️ 自测结果仅作参考，不能替代专业医疗诊断。如有不适请及时就医。
      </div>

      {/* 按系统分组 */}
      {systems.map(system => {
        if (!shouldShowSystem(system.id)) return null

        const organs = getOrgansBySystem(system.id)
          .filter(o => o.selfChecks.length > 0 && shouldShowOrgan(o))

        const sysSummary = getSelfCheckSummary(organs, state.selfCheckResults)
        const sysPct =
          sysSummary.total > 0
            ? Math.round((sysSummary.done / sysSummary.total) * 100)
            : 0

        return (
          <div key={system.id} className="system-group">
            <div className="section-header">
              <span className="section-header-icon">{system.icon}</span>
              <span>{system.name}</span>
              <span className="system-group-count">
                {sysSummary.done}/{sysSummary.total}
              </span>
            </div>
            <div className="system-group-bar">
              <div className="system-group-fill" style={{ width: `${sysPct}%` }} />
            </div>

            {organs.map(organ => {
              const organDone = getOrganDone(organ)

              return (
                <div key={organ.id} className="organ-group">
                  <div className="organ-group-header">
                    <span className="organ-group-name">{organ.name}</span>
                    <span className="organ-group-extra">
                      {organ.earlySymptoms.length > 0 && (
                        <span className="organ-symptom-hint">
                          注意：{organ.earlySymptoms.slice(0, 2).join('、')}
                          {organ.earlySymptoms.length > 2 && '…'}
                        </span>
                      )}
                      <span className="organ-check-count">
                        {organDone}/{organ.selfChecks.length}
                      </span>
                    </span>
                  </div>

                  {organ.selfChecks.map((check, i) => {
                    if (!shouldShowCheck(organ.id, i)) return null
                    return (
                      <SelfCheckItem
                        key={i}
                        check={check}
                        organId={organ.id}
                        index={i}
                        currentResult={getCurrentResult(organ.id, i)}
                        onSetResult={handleToggle}
                      />
                    )
                  })}
                </div>
              )
            })}
          </div>
        )
      })}

      {summary.total === 0 && (
        <div className="empty-state">
          <p>暂无自测项目数据</p>
        </div>
      )}
    </div>
  )
}
