import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { Link, useParams } from 'react-router-dom'
import api from '../api/axios'
import { useTheme } from '../context/ThemeContext'

export default function KnowledgeBase() {
  const { id } = useParams()
  const T = useTheme()
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [botName, setBotName] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ title: '', content: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    try {
      const [botRes, knowledgeRes] = await Promise.all([
        api.get(`/chatbots/${id}`),
        api.get(`/chatbots/${id}/knowledge`)
      ])
      setBotName(botRes.data.name)
      setEntries(knowledgeRes.data)
    } catch (err) {
      toast.error('Failed to load')
    } finally {
      setLoading(false)
    }
  }

  const saveEntry = async () => {
    if (!form.title.trim() || !form.content.trim()) { toast.error('Title and content are required'); return }
    setSaving(true)
    try {
      if (editing) {
        await api.put(`/knowledge/${editing}`, { title: form.title, content: form.content })
        toast.success('Updated!')
      } else {
        await api.post(`/chatbots/${id}/knowledge`, { title: form.title, content: form.content })
        toast.success('Added!')
      }
      setForm({ title: '', content: '' })
      setShowForm(false)
      setEditing(null)
      fetchData()
    } catch (err) {
      toast.error('Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const deleteEntry = async (knowledgeId) => {
    if (!confirm('Delete this entry?')) return
    try {
      await api.delete(`/knowledge/${knowledgeId}`)
      toast.success('Deleted')
      fetchData()
    } catch (err) {
      toast.error('Failed to delete')
    }
  }

  const startEdit = (entry) => {
    setForm({ title: entry.title, content: entry.rawContent })
    setEditing(entry._id)
    setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const inputStyle = { width: '100%', padding: '10px 14px', background: T.inputBg, border: `1px solid ${T.inputBorder}`, borderRadius: 8, fontSize: 14, color: T.text, outline: 'none', fontFamily: "'Inter', sans-serif", marginBottom: 14 }
  const labelStyle = { display: 'block', fontSize: 12, fontWeight: 500, color: T.textSecondary, marginBottom: 6 }

  if (loading) return (
    <div style={{ background: T.bg, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span style={{ color: T.textMuted }}>Loading...</span>
    </div>
  )

  return (
    <div style={{ background: T.bg, minHeight: '100vh', fontFamily: "'Inter', sans-serif", color: T.text }}>
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 48px', borderBottom: `1px solid ${T.border}`, background: T.navBg, position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link to={`/bot/${id}`} style={{ fontSize: 13, color: T.textMuted, textDecoration: 'none' }}>← Back</Link>
          <span style={{ color: T.border }}>|</span>
          <span style={{ fontSize: 14, fontWeight: 600, color: T.text }}>{botName}</span>
          <span style={{ color: T.border }}>|</span>
          <span style={{ fontSize: 13, color: T.textMuted }}>Knowledge base</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <ThemeToggle />
          <button onClick={() => { setShowForm(true); setEditing(null); setForm({ title: '', content: '' }) }}
            style={{ background: T.accent, color: T.accentText, padding: '8px 18px', borderRadius: 7, fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer', fontFamily: "'Inter', sans-serif" }}>
            + Add content
          </button>
        </div>
      </nav>

      <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 48px' }}>
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 34, color: T.heading, letterSpacing: '-0.5px', marginBottom: 6 }}>Knowledge base</h1>
          <p style={{ fontSize: 14, color: T.textMuted }}>Paste any text — your bot learns from it automatically</p>
        </div>

        {showForm && (
          <div style={{ background: T.cardBg, border: `1px solid ${T.accent}`, borderRadius: 10, padding: '24px', marginBottom: 20 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: T.text, marginBottom: 18 }}>{editing ? 'Edit content' : 'Add new content'}</div>
            <label style={labelStyle}>Title</label>
            <input style={inputStyle} type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="e.g. Store Info" autoFocus />
            <label style={labelStyle}>Content</label>
            <textarea value={form.content} onChange={e => setForm({ ...form, content: e.target.value })}
              placeholder="Paste any text here..."
              style={{ ...inputStyle, minHeight: 120, resize: 'vertical', lineHeight: 1.7, marginBottom: 6 }} />
            <p style={{ fontSize: 11, color: T.textMuted, marginBottom: 16 }}>The bot splits this into sentences and matches them automatically.</p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => { setShowForm(false); setEditing(null); setForm({ title: '', content: '' }) }}
                style={{ flex: 1, padding: '10px', borderRadius: 8, background: 'transparent', color: T.textSecondary, border: `1px solid ${T.border}`, fontSize: 13, cursor: 'pointer', fontFamily: "'Inter', sans-serif" }}>Cancel</button>
              <button onClick={saveEntry} disabled={saving}
                style={{ flex: 1, padding: '10px', borderRadius: 8, background: T.accent, color: T.accentText, border: 'none', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: "'Inter', sans-serif", opacity: saving ? 0.7 : 1 }}>
                {saving ? 'Saving...' : editing ? 'Update' : 'Save content'}
              </button>
            </div>
          </div>
        )}

        {entries.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '64px 40px', border: `1px solid ${T.border}`, borderRadius: 12, background: T.cardBg }}>
            <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 26, color: T.heading, marginBottom: 8 }}>No content yet</div>
            <p style={{ fontSize: 14, color: T.textMuted, marginBottom: 24 }}>Add your first knowledge entry to get started</p>
            <button onClick={() => setShowForm(true)} style={{ background: T.accent, color: T.accentText, padding: '10px 22px', borderRadius: 8, fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer', fontFamily: "'Inter', sans-serif" }}>
              Add first entry
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 1, background: T.border, border: `1px solid ${T.border}`, borderRadius: 12, overflow: 'hidden' }}>
            {entries.map(entry => (
              <div key={entry._id} style={{ padding: '18px 24px', background: T.bg, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: T.text }}>{entry.title}</span>
                    <span style={{ fontSize: 11, fontWeight: 500, padding: '2px 8px', borderRadius: 99, background: T.amberBg, color: T.amberText, border: `1px solid ${T.amberBorder}` }}>
                      {entry.chunks?.length || 0} chunks
                    </span>
                  </div>
                  <p style={{ fontSize: 13, color: T.textMuted, lineHeight: 1.6, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                    {entry.rawContent}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                  <button onClick={() => startEdit(entry)} style={{ padding: '6px 14px', borderRadius: 7, background: 'transparent', color: T.textSecondary, border: `1px solid ${T.border}`, fontSize: 12, cursor: 'pointer', fontFamily: "'Inter', sans-serif" }}>Edit</button>
                  <button onClick={() => deleteEntry(entry._id)} style={{ padding: '6px 14px', borderRadius: 7, background: T.dangerBg, color: T.dangerText, border: `1px solid ${T.dangerBorder}`, fontSize: 12, cursor: 'pointer', fontFamily: "'Inter', sans-serif" }}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function ThemeToggle() {
  const T = useTheme()
  return (
    <button onClick={T.toggleTheme} title={T.isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      style={{ width: 36, height: 36, borderRadius: 8, border: `1px solid ${T.border}`, background: T.bgSecondary, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>
      {T.isDark ? '☀️' : '🌙'}
    </button>
  )
}