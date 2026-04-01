import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { Link, useNavigate, useParams } from 'react-router-dom'
import api from '../api/axios'
import { useTheme } from '../context/ThemeContext'

export default function BotBuilder() {
  const { id } = useParams()
  const navigate = useNavigate()
  const T = useTheme()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [bot, setBot] = useState(null)
  const [apiKey, setApiKey] = useState('')
  const [apiProvider, setApiProvider] = useState('anthropic')
  const [apiModel, setApiModel] = useState('')
  const [savingKey, setSavingKey] = useState(false)

  useEffect(() => { fetchBot() }, [])

  const fetchBot = async () => {
    try {
      const res = await api.get(`/chatbots/${id}`)
      setBot(res.data)
    } catch (err) {
      toast.error('Bot not found')
      navigate('/dashboard')
    } finally {
      setLoading(false)
    }
  }

  const saveBot = async () => {
    setSaving(true)
    try {
      await api.put(`/chatbots/${id}`, {
        name: bot.name,
        greetingMessage: bot.greetingMessage,
        responseMode: bot.responseMode,
        appearance: {
          backgroundColor: bot.appearance.backgroundColor,
          bubbleColor: bot.appearance.bubbleColor,
          fontColor: bot.appearance.fontColor,
          botDisplayName: bot.appearance.botDisplayName,
          logoUrl: bot.appearance.logoUrl,
          avatarUrl: bot.appearance.avatarUrl
        }
      })
      toast.success('Bot saved!')
    } catch (err) {
      toast.error('Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const saveApiKey = async () => {
    if (!apiKey.trim()) return
    setSavingKey(true)
    try {
      await api.post(`/chatbots/${id}/apikey`, { apiKey, provider: apiProvider, model: apiModel || null })
      toast.success('API key saved securely!')
      setApiKey('')
      setApiModel('')
      fetchBot()
    } catch (err) {
      toast.error('Failed to save API key')
    } finally {
      setSavingKey(false)
    }
  }

  const deleteApiKey = async () => {
    if (!confirm('Remove your API key?')) return
    try {
      await api.delete(`/chatbots/${id}/apikey`)
      toast.success('API key removed')
      fetchBot()
    } catch (err) {
      toast.error('Failed to remove key')
    }
  }

  const updateAppearance = (key, value) => setBot({ ...bot, appearance: { ...bot.appearance, [key]: value } })

  const inputStyle = { width: '100%', padding: '10px 14px', background: T.inputBg, border: `1px solid ${T.inputBorder}`, borderRadius: 8, fontSize: 14, color: T.text, outline: 'none', fontFamily: "'Inter', sans-serif", marginBottom: 14 }
  const labelStyle = { display: 'block', fontSize: 12, fontWeight: 500, color: T.textSecondary, marginBottom: 6 }
  const sectionCard = { background: T.cardBg, border: `1px solid ${T.border}`, borderRadius: 10, padding: '24px', marginBottom: 12 }

  if (loading) return (
    <div style={{ background: T.bg, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span style={{ color: T.textMuted }}>Loading...</span>
    </div>
  )

  return (
    <div style={{ background: T.bg, minHeight: '100vh', fontFamily: "'Inter', sans-serif", color: T.text }}>
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 48px', borderBottom: `1px solid ${T.border}`, background: T.navBg, position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link to="/dashboard" style={{ fontSize: 13, color: T.textMuted, textDecoration: 'none' }}>← Back</Link>
          <span style={{ color: T.border }}>|</span>
          <span style={{ fontSize: 14, fontWeight: 600, color: T.text }}>{bot.name}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Theme toggle */}
          <button onClick={() => { const ctx = require('../context/ThemeContext'); }} style={{ display: 'none' }} />
          <ThemeToggle />
          <Link to={`/bot/${id}/knowledge`} style={{ padding: '8px 16px', borderRadius: 7, border: `1px solid ${T.border}`, background: 'transparent', color: T.textSecondary, fontSize: 13, textDecoration: 'none' }}>Knowledge base</Link>
          <Link to={`/bot/${id}/embed`} style={{ padding: '8px 16px', borderRadius: 7, border: `1px solid ${T.border}`, background: 'transparent', color: T.textSecondary, fontSize: 13, textDecoration: 'none' }}>Embed code</Link>
          <button onClick={saveBot} disabled={saving} style={{ background: T.accent, color: T.accentText, padding: '8px 20px', borderRadius: 7, fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer', fontFamily: "'Inter', sans-serif", opacity: saving ? 0.7 : 1 }}>
            {saving ? 'Saving...' : 'Save changes'}
          </button>
        </div>
      </nav>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
        {/* Left */}
        <div style={{ padding: '32px 40px', borderRight: `1px solid ${T.border}` }}>
          <div style={sectionCard}>
            <div style={{ fontSize: 13, fontWeight: 600, color: T.text, marginBottom: 18 }}>Basic settings</div>
            <label style={labelStyle}>Bot name</label>
            <input style={inputStyle} type="text" value={bot.name} onChange={e => setBot({ ...bot, name: e.target.value })} />
            <label style={labelStyle}>Greeting message</label>
            <input style={inputStyle} type="text" value={bot.greetingMessage} onChange={e => setBot({ ...bot, greetingMessage: e.target.value })} />
            <label style={labelStyle}>Display name</label>
            <input style={inputStyle} type="text" value={bot.appearance.botDisplayName} onChange={e => updateAppearance('botDisplayName', e.target.value)} />
            <label style={labelStyle}>Response mode</label>
            <select style={inputStyle} value={bot.responseMode} onChange={e => setBot({ ...bot, responseMode: e.target.value })}>
              <option value="keyword">Keyword matching (free)</option>
              <option value="ai">AI powered (requires API key)</option>
            </select>
          </div>

          <div style={sectionCard}>
            <div style={{ fontSize: 13, fontWeight: 600, color: T.text, marginBottom: 18 }}>Appearance</div>
            {[
              { label: 'Bubble color', key: 'bubbleColor' },
              { label: 'Background color', key: 'backgroundColor' },
              { label: 'Font color', key: 'fontColor' },
            ].map(({ label, key }) => (
              <div key={key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <span style={{ fontSize: 13, color: T.textSecondary }}>{label}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 12, color: T.textMuted, fontFamily: 'monospace' }}>{bot.appearance[key]}</span>
                  <input type="color" value={bot.appearance[key]} onChange={e => updateAppearance(key, e.target.value)}
                    style={{ width: 32, height: 32, borderRadius: 6, border: `1px solid ${T.border}`, cursor: 'pointer', background: 'none', padding: 2 }} />
                </div>
              </div>
            ))}
          </div>

          <div style={sectionCard}>
            <div style={{ fontSize: 13, fontWeight: 600, color: T.text, marginBottom: 4 }}>AI API key</div>
            <p style={{ fontSize: 12, color: T.textMuted, marginBottom: 16 }}>Encrypted with AES-256. We can never read it. Delete anytime.</p>
            {bot.apiKeyPreview ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: T.inputBg, border: `1px solid ${T.border}`, borderRadius: 8, padding: '12px 16px' }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: T.text, textTransform: 'capitalize', marginBottom: 2 }}>{bot.apiKeyProvider}</div>
                  <div style={{ fontSize: 12, color: T.textMuted, fontFamily: 'monospace' }}>••••••••{bot.apiKeyPreview}</div>
                </div>
                <button onClick={deleteApiKey} style={{ fontSize: 12, color: T.dangerText, background: 'none', border: 'none', cursor: 'pointer' }}>Remove</button>
              </div>
            ) : (
              <>
                <label style={labelStyle}>Provider</label>
                <select style={inputStyle} value={apiProvider} onChange={e => setApiProvider(e.target.value)}>
                  <option value="anthropic">Anthropic (Claude)</option>
                  <option value="openai">OpenAI (GPT-4, GPT-3.5)</option>
                  <option value="google">Google (Gemini)</option>
                  <option value="groq">Groq — free tier available</option>
                  <option value="mistral">Mistral AI</option>
                  <option value="other">Other (OpenAI compatible)</option>
                </select>
                <label style={labelStyle}>Model <span style={{ color: T.textMuted, fontWeight: 400 }}>(optional)</span></label>
                <input style={inputStyle} type="text" value={apiModel} onChange={e => setApiModel(e.target.value)}
                  placeholder={apiProvider === 'groq' ? 'e.g. llama-3.3-70b-versatile' : 'model name'} />
                <label style={labelStyle}>API key</label>
                <input style={inputStyle} type="password" value={apiKey} onChange={e => setApiKey(e.target.value)} placeholder="Paste your API key here" />
                <button onClick={saveApiKey} disabled={savingKey || !apiKey.trim()}
                  style={{ width: '100%', padding: '10px', background: T.accent, color: T.accentText, border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: "'Inter', sans-serif", opacity: (savingKey || !apiKey.trim()) ? 0.5 : 1 }}>
                  {savingKey ? 'Saving...' : 'Save API key securely'}
                </button>
              </>
            )}
          </div>
        </div>

        {/* Right — preview */}
        <div style={{ padding: '32px 40px' }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: T.text, marginBottom: 16 }}>Live preview</div>
          <div style={{ border: `1px solid ${T.border}`, borderRadius: 12, overflow: 'hidden', marginBottom: 12 }}>
            <div style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 8, background: bot.appearance.bubbleColor }}>
              <div style={{ width: 8, height: 8, background: '#4ADE80', borderRadius: '50%' }}></div>
              <span style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>{bot.appearance.botDisplayName}</span>
            </div>
            <div style={{ padding: '16px', background: bot.appearance.backgroundColor, minHeight: 220, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ background: 'rgba(0,0,0,0.06)', borderRadius: '12px 12px 12px 2px', padding: '10px 14px', fontSize: 13, maxWidth: '80%', color: bot.appearance.fontColor }}>
                {bot.greetingMessage}
              </div>
              <div style={{ background: bot.appearance.bubbleColor, borderRadius: '12px 12px 2px 12px', padding: '10px 14px', fontSize: 13, maxWidth: '80%', color: '#fff', alignSelf: 'flex-end' }}>
                What are your hours?
              </div>
              <div style={{ background: 'rgba(0,0,0,0.06)', borderRadius: '12px 12px 12px 2px', padding: '10px 14px', fontSize: 13, maxWidth: '80%', color: bot.appearance.fontColor }}>
                We are open Monday to Saturday, 9am to 6pm!
              </div>
            </div>
            <div style={{ padding: '12px 16px', borderTop: `1px solid ${T.border}`, display: 'flex', gap: 8, background: bot.appearance.backgroundColor }}>
              <div style={{ flex: 1, background: 'rgba(0,0,0,0.04)', borderRadius: 99, padding: '8px 14px', fontSize: 13, color: '#aaa' }}>Type a message...</div>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: bot.appearance.bubbleColor, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 14 }}>↑</div>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, background: T.border, border: `1px solid ${T.border}`, borderRadius: 10, overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', background: T.bg }}>
              <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 28, color: T.heading }}>{bot.totalMessages}</div>
              <div style={{ fontSize: 12, color: T.textMuted, marginTop: 2 }}>Total messages</div>
            </div>
            <div style={{ padding: '16px 20px', background: T.bg }}>
              <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 28, color: T.accent, textTransform: 'capitalize' }}>{bot.responseMode}</div>
              <div style={{ fontSize: 12, color: T.textMuted, marginTop: 2 }}>Response mode</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function ThemeToggle() {
  const T = useTheme()
  return (
    <button
      onClick={T.toggleTheme}
      title={T.isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      style={{ width: 36, height: 36, borderRadius: 8, border: `1px solid ${T.border}`, background: T.bgSecondary, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}
    >
      {T.isDark ? '☀️' : '🌙'}
    </button>
  )
}