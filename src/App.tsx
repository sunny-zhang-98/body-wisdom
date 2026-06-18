import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import Systems from './pages/Systems'
import SystemDetail from './pages/SystemDetail'
import OrganDetail from './pages/OrganDetail'
import Behaviors from './pages/Behaviors'
import BehaviorDetail from './pages/BehaviorDetail'
import Assessment from './pages/Assessment'
import Recommendations from './pages/Recommendations'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/systems" element={<Systems />} />
        <Route path="/systems/:systemId" element={<SystemDetail />} />
        <Route path="/organ/:organId" element={<OrganDetail />} />
        <Route path="/behaviors" element={<Behaviors />} />
        <Route path="/behaviors/:behaviorId" element={<BehaviorDetail />} />
        <Route path="/assessment" element={<Assessment />} />
        <Route path="/recommendations" element={<Recommendations />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
