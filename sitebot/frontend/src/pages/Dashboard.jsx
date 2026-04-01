import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'
import Navbar from '../components/Navbar'
import { useTheme } from '../context/ThemeContext'

export default function Dashboard() {
  const [bots, setBots] = useState([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [newBotName, setNewBotName] = useState('')
  const navigate = useNavigate()
  const T = useTheme()

  useEffect(() => { fetchBots() }, [])

  const fetchBots = async () => {
    try {
      const res = await api.get('/chatbots')
      setBots(res.data)
    } catch (err) {
      toast.error('Failed to load bots')
    } finally {
      setLoading(false)
    }
  }

  const createBot = async () => {
    if (!newBotName.trim()) return
    setCreating(true)
    try {
      const res = await api.post('/chatbots', {
        name: newBotName,
        greetingMessage: 'Hi! How can I help you today?',
        responseMode: 'keyword'
      })
      toast.success('Bot created!')
      setShowModal(false)
      setNewBotName('')
      navigate(`/bot/${res.data._id}`)
    } catch (err) {
      toast.error('Failed to create bot')
    } finally {
      setCreating(false)
    }
  }

  const deleteBot = async (botId) => {
    if (!confirm('Delete this bot?')) return
    try {
      await api.delete(`/chatbots/${botId}`)
      toast.success('Bot deleted')
      fetchBots()
    } catch (err) {
      toast.error('Failed to delete')
    }
  }

  return (
    <div style={{ background: T.bg, minHeight: '100vh', fontFamily: "'Inter', sans-serif", color: T.text }}>
      <Navbar showDashboard={true} />

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 48px' }}>

        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 32 }}>
          <div>
            <h1 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 36, color: T.heading, letterSpacing: '-0.5px', marginBottom: 4 }}>Your chatbots</h1>
            <p style={{ fontSize: 14, color: T.textMuted }}>Manage, customize and embed your bots</p>
          </div>
          <button onClick={() => setShowModal(true)} style={{ background: T.accent, color: T.accentText, padding: '10px 20px', borderRadius: 8, fontSize: 14, fontWeight: 600, border: 'none', cursor: 'pointer', fontFamily: "'Inter', sans-serif" }}>
            + New bot
          </button>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 1, background: T.border, border: `1px solid ${T.border}`, borderRadius: 10, overflow: 'hidden', marginBottom: 32 }}>
          {[
            { label: 'Total bots', val: bots.length },
            { label: 'Total messages', val: bots.reduce((s, b) => s + b.totalMessages, 0) },
            { label: 'Active bots', val: bots.filter(b => b.isActive).length },
          ].map((s, i) => (
            <div key={i} style={{ padding: '20px 24px', background: T.bg }}>
              <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 32, color: T.heading, lineHeight: 1, marginBottom: 4 }}>{s.val}</div>
              <div style={{ fontSize: 12, color: T.textMuted }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Bot list */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: T.textMuted }}>Loading...</div>
        ) : bots.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '72px 40px', border: `1px solid ${T.border}`, borderRadius: 12, background: T.cardBg }}>
            <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 28, color: T.heading, marginBottom: 8 }}>No bots yet</div>
            <p style={{ fontSize: 14, color: T.textMuted, marginBottom: 24 }}>Create your first chatbot to get started</p>
            <button onClick={() => setShowModal(true)} style={{ background: T.accent, color: T.accentText, padding: '10px 22px', borderRadius: 8, fontSize: 14, fontWeight: 600, border: 'none', cursor: 'pointer', fontFamily: "'Inter', sans-serif" }}>
              Create your first bot
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 1, background: T.border, border: `1px solid ${T.border}`, borderRadius: 12, overflow: 'hidden' }}>
            {bots.map(bot => (
              <div key={bot._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 24px', background: T.bg }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: bot.appearance.bubbleColor, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 16, flexShrink: 0 }}>
                    {bot.name[0]}
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: T.text, marginBottom: 3 }}>{bot.name}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: 12, color: T.textMuted }}>{bot.responseMode} mode</span>
                      <span style={{ fontSize: 12, color: T.textMuted }}>·</span>
                      <span style={{ fontSize: 12, color: T.textMuted }}>{bot.totalMessages} messages</span>
                      <span style={{ fontSize: 12, color: T.textMuted }}>·</span>
                      <span style={{ fontSize: 11, fontWeight: 500, padding: '2px 8px', borderRadius: 99, background: bot.isActive ? T.successBg : T.bgTertiary, color: bot.isActive ? T.successText : T.textMuted, border: `1px solid ${bot.isActive ? T.successBorder : T.border}` }}>
                        {bot.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  {[
                    { label: 'Knowledge', action: () => navigate(`/bot/${bot._id}/knowledge`), bg: 'transparent', color: T.textSecondary, border: T.border },
                    { label: 'Embed', action: () => navigate(`/bot/${bot._id}/embed`), bg: 'transparent', color: T.textSecondary, border: T.border },
                    { label: 'Edit', action: () => navigate(`/bot/${bot._id}`), bg: T.amberBg, color: T.amberText, border: T.amberBorder },
                    { label: 'Delete', action: () => deleteBot(bot._id), bg: T.dangerBg, color: T.dangerText, border: T.dangerBorder },
                  ].map((btn, j) => (
                    <button key={j} onClick={btn.action} style={{ padding: '7px 14px', borderRadius: 7, fontSize: 13, fontWeight: 500, cursor: 'pointer', background: btn.bg, color: btn.color, border: `1px solid ${btn.border}`, fontFamily: "'Inter', sans-serif" }}>
                      {btn.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div style={{ background: T.cardBg, border: `1px solid ${T.border}`, borderRadius: 14, padding: '36px', width: '100%', maxWidth: 400 }}>
            <h2 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 26, color: T.heading, marginBottom: 6 }}>Create new bot</h2>
            <p style={{ fontSize: 13, color: T.textMuted, marginBottom: 24 }}>Give your chatbot a name to get started</p>
            <input
              style={{ width: '100%', padding: '11px 14px', background: T.inputBg, border: `1px solid ${T.inputBorder}`, borderRadius: 8, fontSize: 14, color: T.text, outline: 'none', fontFamily: "'Inter', sans-serif", marginBottom: 16 }}
              type="text" placeholder="e.g. Support Bot"
              value={newBotName} onChange={e => setNewBotName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && createBot()} autoFocus
            />
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setShowModal(false)} style={{ flex: 1, padding: '10px', borderRadius: 8, background: 'transparent', color: T.textSecondary, border: `1px solid ${T.border}`, fontSize: 14, cursor: 'pointer', fontFamily: "'Inter', sans-serif" }}>Cancel</button>
              <button onClick={createBot} disabled={creating} style={{ flex: 1, padding: '10px', borderRadius: 8, background: T.accent, color: T.accentText, border: 'none', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: "'Inter', sans-serif", opacity: creating ? 0.7 : 1 }}>
                {creating ? 'Creating...' : 'Create bot'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}