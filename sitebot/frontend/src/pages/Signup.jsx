import { useState } from 'react'
import toast from 'react-hot-toast'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api/axios'
import Navbar from '../components/Navbar'
import { useTheme } from '../context/ThemeContext'

export default function Signup() {
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const T = useTheme()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await api.post('/auth/signup', form)
      localStorage.setItem('token', res.data.token)
      localStorage.setItem('user', JSON.stringify(res.data.user))
      toast.success('Account created!')
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Signup failed')
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

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: 'calc(100vh - 57px)' }}>

        {/* Left */}
        <div style={{ padding: '64px 56px', borderRight: `1px solid ${T.border}`, display: 'flex', flexDirection: 'column', gap: 32 }}>
          <div>
            <h2 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 44, color: T.heading, letterSpacing: '-1.5px', lineHeight: 1.1, marginBottom: 16 }}>
              Start for free.<br />Upgrade anytime.
            </h2>
            <p style={{ fontSize: 15, color: T.textSecondary, lineHeight: 1.75, maxWidth: 340 }}>
              Build your first chatbot in 60 seconds. No credit card. No setup fees. Cancel whenever you want.
            </p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              { title: 'Free forever plan', desc: '1 bot, keyword matching, no time limit.' },
              { title: 'Bring your own AI', desc: 'Use Groq free tier — no API costs to start.' },
              { title: 'Works in any language', desc: 'Hindi, Telugu, French — your bot handles it.' },
              { title: 'One line embed', desc: "Paste one script tag and you're live." },
            ].map((f, i) => (
              <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <div style={{ width: 20, height: 20, background: T.amberBg, border: `1px solid ${T.amberBorder}`, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                  <div style={{ width: 6, height: 6, background: T.accent, borderRadius: '50%' }}></div>
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: T.text, marginBottom: 2 }}>{f.title}</div>
                  <div style={{ fontSize: 13, color: T.textSecondary }}>{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right */}
        <div style={{ padding: '64px 56px', display: 'flex', alignItems: 'flex-start', justifyContent: 'center' }}>
          <div style={{ width: '100%', maxWidth: 400 }}>
            <h1 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 32, color: T.heading, letterSpacing: '-0.5px', marginBottom: 6 }}>Create your account</h1>
            <p style={{ fontSize: 14, color: T.textMuted, marginBottom: 32 }}>Free forever. No credit card needed.</p>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: T.textSecondary, marginBottom: 6 }}>Your name</label>
                <input style={inputStyle} type="text" required placeholder="Rohit Raj"
                  value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: T.textSecondary, marginBottom: 6 }}>Email address</label>
                <input style={inputStyle} type="email" required placeholder="you@example.com"
                  value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
              </div>
              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: T.textSecondary, marginBottom: 6 }}>Password</label>
                <input style={inputStyle} type="password" required placeholder="Min 6 characters"
                  value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
              </div>
              <button type="submit" disabled={loading}
                style={{ width: '100%', padding: '12px', background: T.accent, color: T.accentText, border: 'none', borderRadius: 8, fontSize: 15, fontWeight: 600, cursor: 'pointer', fontFamily: "'Inter', sans-serif", opacity: loading ? 0.7 : 1 }}>
                {loading ? 'Creating account...' : 'Create free account →'}
              </button>
            </form>
            <p style={{ textAlign: 'center', fontSize: 13, color: T.textMuted, marginTop: 24 }}>
              Already have an account?{' '}
              <Link to="/login" style={{ color: T.accent, textDecoration: 'none', fontWeight: 500 }}>Sign in</Link>
            </p>
            <p style={{ textAlign: 'center', fontSize: 11, color: T.textTertiary, marginTop: 16, lineHeight: 1.6 }}>
              By creating an account you agree to our Terms of Service and Privacy Policy.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}