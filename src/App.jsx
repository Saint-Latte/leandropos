import { HashRouter, Routes, Route } from 'react-router-dom'
import BottomNav from './components/layout/BottomNav'
import POS from './pages/POS'
import Register from './pages/Register'
import Reports from './pages/Reports'
import Menu from './pages/Menu'
import Settings from './pages/Settings'

export default function App() {
  return (
    <HashRouter>
      <div className="flex flex-col h-full">
        <Routes>
          <Route path="/"         element={<POS />} />
          <Route path="/register" element={<Register />} />
          <Route path="/reports"  element={<Reports />} />
          <Route path="/menu"     element={<Menu />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
        <BottomNav />
      </div>
    </HashRouter>
  )
}
