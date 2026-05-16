import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { Link, useParams } from 'react-router-dom'
import api from '../api/axios'
import { useTheme } from '../context/ThemeContext'

export default function EmbedCode() {
  const { id } = useParams()
  const T = useTheme()
  const [bot, setBot] = useState(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [activeTab, setActiveTab] = useState('html') // 'html' | 'react'

  useEffect(() => {
    api.get(`/chatbots/${id}`)
      .then(res => setBot(res.data))
      .catch(() => toast.error('Failed to load bot'))
      .finally(() => setLoading(false))
  }, [])

  const backendUrl = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace('/api', '')

  const htmlEmbedCode = `<script src="${backendUrl}/widget/widget.js" data-bot-id="${id}" data-api-url="${backendUrl}"></script>`

  const reactEmbedCode = `import { useEffect } from 'react'

export default function ChatbotWidget() {
  useEffect(() => {
    // Avoid duplicate script injection
    if (document.querySelector('script[data-bot-id="${id}"]')) return

    const script = document.createElement('script')
    script.src = '${backendUrl}/widget/widget.js'
    script.setAttribute('data-bot-id', '${id}')
    script.setAttribute('data-api-url', '${backendUrl}')
    document.body.appendChild(script)

    return () => {
      // Optional cleanup on unmount
      const el = document.querySelector('script[data-bot-id="${id}"]')
      if (el) el.remove()
    }
  }, [])

  return null
}`

  const activeCode = activeTab === 'html' ? htmlEmbedCode : reactEmbedCode

  const copyCode = () => {
    navigator.clipboard.writeText(activeCode)
    setCopied(true)
    toast.success('Copied!')
    setTimeout(() => setCopied(false), 2000)
  }

  const tabs = [
    { key: 'html', label: 'HTML / Script tag' },
    { key: 'react', label: 'React component' },
  ]

  const htmlSteps = [
    { title: 'Copy the code above', desc: 'Click the Copy button to copy your embed code.' },
    { title: 'Open your website HTML', desc: "Find the file that contains your website's HTML — usually index.html." },
    { title: 'Paste before the closing body tag', desc: 'Find </body> at the bottom and paste the code just above it.' },
    { title: 'Save and refresh', desc: 'The chat bubble will appear in the bottom right corner of your site.' },
  ]

  const reactSteps = [
    { title: 'Create the component file', desc: 'Save the code above as ChatbotWidget.jsx anywhere in your src folder.' },
    { title: 'Import it in your app', desc: "Open App.jsx (or your root layout) and import ChatbotWidget from './ChatbotWidget'." },
    { title: 'Render it once', desc: 'Add <ChatbotWidget /> anywhere inside your JSX — it renders nothing visible but injects the widget script.' },
    { title: 'Save and run', desc: 'The chat bubble will appear in the bottom right corner of your site.' },
  ]

  const steps = activeTab === 'html' ? htmlSteps : reactSteps

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
          <span style={{ fontSize: 14, fontWeight: 600, color: T.text }}>{bot?.name}</span>
          <span style={{ color: T.border }}>|</span>
          <span style={{ fontSize: 13, color: T.textMuted }}>Embed code</span>
        </div>
        <ThemeToggle />
      </nav>

      <div style={{ maxWidth: 720, margin: '0 auto', padding: '40px 48px' }}>
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 34, color: T.heading, letterSpacing: '-0.5px', marginBottom: 6 }}>Embed your chatbot</h1>
          <p style={{ fontSize: 14, color: T.textMuted }}>Choose your setup below and paste the code into your project.</p>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 16, background: T.bgSecondary, border: `1px solid ${T.border}`, borderRadius: 8, padding: 4, width: 'fit-content' }}>
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => { setActiveTab(tab.key); setCopied(false) }}
              style={{
                padding: '6px 16px',
                borderRadius: 6,
                border: 'none',
                fontSize: 13,
                fontWeight: 500,
                cursor: 'pointer',
                fontFamily: "'Inter', sans-serif",
                background: activeTab === tab.key ? T.cardBg : 'transparent',
                color: activeTab === tab.key ? T.text : T.textMuted,
                boxShadow: activeTab === tab.key ? `0 1px 3px rgba(0,0,0,0.08)` : 'none',
                transition: 'all 0.15s ease',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Code block */}
        <div style={{ background: T.codeBg, border: `1px solid ${T.border}`, borderRadius: 10, padding: '20px 24px', marginBottom: 12, position: 'relative' }}>
          <pre style={{ color: T.codeText, fontSize: 13, fontFamily: 'monospace', wordBreak: 'break-all', whiteSpace: 'pre-wrap', overflowWrap: 'anywhere', lineHeight: 1.7, margin: 0, paddingRight: activeTab === 'html' ? 80 : 0 }}>
            {activeCode}
          </pre>
          <button
            onClick={copyCode}
            style={{
              position: 'absolute',
              top: 16,
              right: 16,
              background: copied ? T.successBg : T.bgTertiary,
              color: copied ? T.successText : T.textSecondary,
              border: `1px solid ${copied ? T.successBorder : T.border}`,
              padding: '6px 14px',
              borderRadius: 6,
              fontSize: 12,
              cursor: 'pointer',
              fontFamily: "'Inter', sans-serif",
            }}
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>

        {/* Steps */}
        <div style={{ background: T.cardBg, border: `1px solid ${T.border}`, borderRadius: 10, overflow: 'hidden', marginBottom: 12 }}>
          <div style={{ padding: '18px 24px', borderBottom: `1px solid ${T.border}` }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: T.text }}>How to install</div>
          </div>
          {steps.map((step, i) => (
            <div key={i} style={{ display: 'flex', gap: 16, padding: '16px 24px', borderBottom: i < steps.length - 1 ? `1px solid ${T.border}` : 'none', alignItems: 'flex-start' }}>
              <div style={{ width: 24, height: 24, borderRadius: '50%', background: T.amberBg, border: `1px solid ${T.amberBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: T.accent }}>{i + 1}</span>
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: T.text, marginBottom: 3 }}>{step.title}</div>
                <div style={{ fontSize: 13, color: T.textMuted, lineHeight: 1.6 }}>{step.desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Platform tips — only for HTML tab */}
        {activeTab === 'html' && (
          <div style={{ background: T.cardBg, border: `1px solid ${T.border}`, borderRadius: 10, padding: '20px 24px' }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: T.text, marginBottom: 14 }}>Platform specific tips</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
              {[
                { platform: 'WordPress', tip: "Use a Custom HTML block or paste in your theme's footer.php file." },
                { platform: 'Shopify', tip: 'Go to Online Store → Themes → Edit code → paste in theme.liquid.' },
                { platform: 'Webflow', tip: 'Go to Project Settings → Custom Code → paste in Footer code.' },
              ].map((p, i) => (
                <div key={i} style={{ padding: '14px', background: T.bg, border: `1px solid ${T.border}`, borderRadius: 8 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: T.accent, marginBottom: 6 }}>{p.platform}</div>
                  <div style={{ fontSize: 12, color: T.textMuted, lineHeight: 1.6 }}>{p.tip}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* React-specific tips */}
        {activeTab === 'react' && (
          <div style={{ background: T.cardBg, border: `1px solid ${T.border}`, borderRadius: 10, padding: '20px 24px' }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: T.text, marginBottom: 14 }}>Framework specific tips</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
              {[
                { platform: 'Vite + React', tip: 'Add <ChatbotWidget /> inside App.jsx, outside any conditional renders.' },
                { platform: 'Next.js', tip: "Place in app/layout.tsx or pages/_app.tsx so it loads on every page. Use 'use client' at the top." },
                { platform: 'Remix', tip: 'Add to root.tsx inside the <body> of your default export layout.' },
              ].map((p, i) => (
                <div key={i} style={{ padding: '14px', background: T.bg, border: `1px solid ${T.border}`, borderRadius: 8 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: T.accent, marginBottom: 6 }}>{p.platform}</div>
                  <div style={{ fontSize: 12, color: T.textMuted, lineHeight: 1.6 }}>{p.tip}</div>
                </div>
              ))}
            </div>
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