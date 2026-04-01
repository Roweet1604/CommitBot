import { useState } from 'react'
import toast from 'react-hot-toast'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api/axios'
import Navbar from '../components/Navbar'
import { useTheme } from '../context/ThemeContext'

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const T = useTheme()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await api.post('/auth/login', form)
      localStorage.setItem('token', res.data.token)
      localStorage.setItem('user', JSON.stringify(res.data.user))
      toast.success('Welcome back!')
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = {
    width: '100%', padding: '11px 14px',
    background: T.inputBg, border: `1px solid ${T.inputBorder}`,
    borderRadius: 8, fontSize: 14, color: T.text,
    outline: 'none', fontFamily: "'Inter', sans-serif"
  }

  return (
    <div style={{ background: T.bg, minHeight: '100vh', fontFamily: "'Inter', sans-serif", color: T.text }}>
      <Navbar />

      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: 'calc(100vh - 57px)' }}>

        {/* Left */}
        <div style={{ padding: '64px 56px', borderRight: `1px solid ${T.border}`, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 44, color: T.heading, letterSpacing: '-1.5px', lineHeight: 1.1, marginBottom: 16 }}>
              Welcome<br />back.
            </h2>
            <p style={{ fontSize: 15, color: T.textSecondary, lineHeight: 1.75, maxWidth: 340 }}>
              Sign in to manage your chatbots, update your knowledge base, and see how your visitors are engaging.
            </p>
          </div>
          <div style={{ background: T.cardBg, border: `1px solid ${T.border}`, borderRadius: 10, padding: '20px 24px' }}>
            <p style={{ fontSize: 14, color: T.textSecondary, lineHeight: 1.7, marginBottom: 12 }}>
              "CommitBot cut our support messages by 60%. Our customers get answers instantly, even at 2am."
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 32, height: 32, background: T.accent, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.accentText, fontWeight: 700, fontSize: 12 }}>R</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: T.text }}>Rahul Sharma</div>
                <div style={{ fontSize: 11, color: T.textMuted }}>Founder, QuickShop India</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right */}
        <div style={{ padding: '64px 56px', display: 'flex', alignItems: 'flex-start', justifyContent: 'center' }}>
          <div style={{ width: '100%', maxWidth: 400 }}>
            <h1 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 32, color: T.heading, letterSpacing: '-0.5px', marginBottom: 6 }}>Sign in</h1>
            <p style={{ fontSize: 14, color: T.textMuted, marginBottom: 32 }}>Enter your credentials to continue</p>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: T.textSecondary, marginBottom: 6 }}>Email address</label>
                <input style={inputStyle} type="email" required placeholder="you@example.com"
                  value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
              </div>
              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: T.textSecondary, marginBottom: 6 }}>Password</label>
                <input style={inputStyle} type="password" required placeholder="••••••••"
                  value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
              </div>
              <button type="submit" disabled={loading}
                style={{ width: '100%', padding: '12px', background: T.accent, color: T.accentText, border: 'none', borderRadius: 8, fontSize: 15, fontWeight: 600, cursor: 'pointer', fontFamily: "'Inter', sans-serif", opacity: loading ? 0.7 : 1 }}>
                {loading ? 'Signing in...' : 'Sign in →'}
              </button>
            </form>
            <p style={{ textAlign: 'center', fontSize: 13, color: T.textMuted, marginTop: 24 }}>
              Don't have an account?{' '}
              <Link to="/signup" style={{ color: T.accent, textDecoration: 'none', fontWeight: 500 }}>Sign up free</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}