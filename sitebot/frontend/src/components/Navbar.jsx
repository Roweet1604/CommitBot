import { Link, useNavigate } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'

export default function Navbar({ showAuth = false, showDashboard = false }) {
  const T = useTheme()
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
  }

  return (
    <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 48px', borderBottom: `1px solid ${T.border}`, background: T.navBg, position: 'sticky', top: 0, zIndex: 100 }}>
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
        <div style={{ width: 30, height: 30, background: T.accent, borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.accentText, fontWeight: 700, fontSize: 14 }}>C</div>
        <span style={{ fontSize: 15, fontWeight: 600, color: T.text }}>CommitBot</span>
      </Link>

      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        {/* Theme toggle */}
        <button
          onClick={T.toggleTheme}
          title={T.isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          style={{ width: 36, height: 36, borderRadius: 8, border: `1px solid ${T.border}`, background: T.bgSecondary, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, transition: 'all 0.2s' }}
        >
          {T.isDark ? '☀️' : '🌙'}
        </button>

        {showAuth && (
          <>
            <Link to="/login" style={{ fontSize: 13, color: T.textSecondary, textDecoration: 'none' }}>Sign in</Link>
            <Link to="/signup" style={{ background: T.accent, color: T.accentText, padding: '8px 18px', borderRadius: 7, fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>Start free →</Link>
          </>
        )}

        {showDashboard && (
          <>
            <span style={{ fontSize: 13, color: T.textMuted }}>Hey, {user.name}</span>
            <button onClick={logout} style={{ fontSize: 13, color: T.textMuted, background: 'none', border: 'none', cursor: 'pointer', fontFamily: "'Inter', sans-serif" }}>Logout</button>
          </>
        )}
      </div>
    </nav>
  )
}