import { Outlet, useLocation } from 'react-router-dom'
import NavBar from './NavBar'
import DisclaimerBanner from './DisclaimerBanner'

// Pages where the disclaimer should NOT be shown at the top (already inside the page)
const noTopDisclaimer = ['/assessment', '/recommendations']

export default function Layout() {
  const location = useLocation()
  const showTopDisclaimer = !noTopDisclaimer.includes(location.pathname)

  return (
    <div className="layout">
      {showTopDisclaimer && <DisclaimerBanner />}
      <Outlet />
      <NavBar />
    </div>
  )
}
