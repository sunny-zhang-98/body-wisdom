import { useParams } from 'react-router-dom'
import { getSystemById } from '../loaders/loadSystems'
import { getOrgansBySystem } from '../loaders/loadOrgans'
import OrganCard from '../components/OrganCard'

export default function SystemDetail() {
  const { systemId } = useParams<{ systemId: string }>()
  const system = systemId ? getSystemById(systemId) : undefined
  const organs = systemId ? getOrgansBySystem(systemId) : []

  if (!system) {
    return (
      <div className="page">
        <div className="empty-state">未找到该系统</div>
      </div>
    )
  }

  return (
    <div className="page">
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
        <span style={{ fontSize: 28 }}>{system.icon}</span>
        <div>
          <h1 className="page-title" style={{ marginBottom: 0 }}>{system.name}</h1>
        </div>
      </div>
      <p className="page-subtitle">{system.description}</p>

      {organs.length === 0 ? (
        <div className="empty-state">该系统暂无器官数据</div>
      ) : (
        <div className="list">
          {organs.map(organ => (
            <OrganCard key={organ.id} organ={organ} />
          ))}
        </div>
      )}
    </div>
  )
}
