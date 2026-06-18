import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getBehaviors, getBehaviorCategories } from '../loaders/loadBehaviors'
import BehaviorCard from '../components/BehaviorCard'

type TypeFilter = 'all' | 'beneficial' | 'harmful'

export default function Behaviors() {
  const navigate = useNavigate()
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')

  const allBehaviors = getBehaviors()
  const categories = getBehaviorCategories()

  const filtered = allBehaviors.filter(b => {
    if (typeFilter !== 'all' && b.type !== typeFilter) return false
    if (categoryFilter !== 'all' && b.category !== categoryFilter) return false
    return true
  })

  return (
    <div className="page">
      <h1 className="page-title">行为清单</h1>
      <p className="page-subtitle">了解每种行为的量化标准和健康影响</p>

      {/* Type filter */}
      <div className="behavior-tags" style={{ marginBottom: 10 }}>
        {(['all', 'beneficial', 'harmful'] as TypeFilter[]).map(t => (
          <button
            key={t}
            className={`tag ${typeFilter === t ? (t === 'beneficial' ? 'tag-beneficial' : t === 'harmful' ? 'tag-harmful' : '') : ''}`}
            onClick={() => setTypeFilter(t)}
            style={{
              cursor: 'pointer',
              opacity: typeFilter === t ? 1 : 0.5,
              border: '1px solid var(--color-border)',
              background: typeFilter === t ? undefined : 'transparent',
              color: typeFilter === t ? undefined : 'var(--color-text-secondary)',
            }}
          >
            {t === 'all' ? '全部' : t === 'beneficial' ? '✅ 有益' : '❌ 有害'}
          </button>
        ))}
      </div>

      {/* Category filter */}
      <div className="behavior-tags" style={{ marginBottom: 12 }}>
        <button
          className="tag"
          onClick={() => setCategoryFilter('all')}
          style={{
            cursor: 'pointer',
            opacity: categoryFilter === 'all' ? 1 : 0.5,
            border: '1px solid var(--color-border)',
            background: categoryFilter === 'all' ? 'var(--color-primary)' : 'transparent',
            color: categoryFilter === 'all' ? '#fff' : 'var(--color-text-secondary)',
          }}
        >
          全部分类
        </button>
        {categories.map(cat => (
          <button
            key={cat}
            className="tag"
            onClick={() => setCategoryFilter(cat)}
            style={{
              cursor: 'pointer',
              opacity: categoryFilter === cat ? 1 : 0.5,
              border: '1px solid var(--color-border)',
              background: categoryFilter === cat ? 'var(--color-primary)' : 'transparent',
              color: categoryFilter === cat ? '#fff' : 'var(--color-text-secondary)',
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginBottom: 8 }}>
        共 {filtered.length} 条行为
      </p>

      {filtered.length === 0 ? (
        <div className="empty-state">没有匹配的行为</div>
      ) : (
        <div className="list">
          {filtered.map(b => (
            <BehaviorCard
              key={b.id}
              behavior={b}
              onClick={() => navigate(`/behaviors/${b.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
