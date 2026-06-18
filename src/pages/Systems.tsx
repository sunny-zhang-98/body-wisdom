import { useNavigate } from 'react-router-dom'
import { getSystems } from '../loaders/loadSystems'
import { getOrgansBySystem } from '../loaders/loadOrgans'

export default function Systems() {
  const navigate = useNavigate()
  const systems = getSystems()

  return (
    <div className="page">
      <h1 className="page-title">人体系统</h1>
      <p className="page-subtitle">共 {systems.length} 大系统 · 了解各系统器官的健康知识</p>
      {systems.length === 0 ? (
        <div className="empty-state">暂无系统数据</div>
      ) : (
        <div className="list">
          {systems.map(system => {
            const organCount = getOrgansBySystem(system.id).length
            return (
              <div
                key={system.id}
                className="system-card"
                onClick={() => navigate(`/systems/${system.id}`)}
              >
                <div className="system-card-icon">{system.icon}</div>
                <div className="system-card-info">
                  <div className="system-card-name">{system.name}</div>
                  <div className="system-card-desc">{system.description}</div>
                </div>
                <div className="system-card-count">{organCount} 个</div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
