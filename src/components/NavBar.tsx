import { NavLink } from 'react-router-dom'

const navItems = [
  { to: '/', label: '首页', icon: '🏠' },
  { to: '/systems', label: '系统', icon: '📋' },
  { to: '/behaviors', label: '行为', icon: '🏃' },
  { to: '/assessment', label: '评估', icon: '📊' },
  { to: '/recommendations', label: '推荐', icon: '💡' },
]

export default function NavBar() {
  return (
    <nav className="nav-bar">
      {navItems.map(item => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.to === '/'}
          className={({ isActive }) =>
            `nav-item${isActive ? ' active' : ''}`
          }
        >
          <span className="nav-icon">{item.icon}</span>
          <span className="nav-label">{item.label}</span>
        </NavLink>
      ))}
    </nav>
  )
}
