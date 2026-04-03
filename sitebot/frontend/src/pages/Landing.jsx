import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { useTheme } from '../context/ThemeContext'

export default function Landing() {
  const T = useTheme()

  return (
    <div style={{ background: T.bg, minHeight: '100vh', fontFamily: "'Inter', sans-serif", color: T.text }}>

      <Navbar showAuth={true} />

      {/* Hero */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderBottom: `1px solid ${T.border}` }}>
        <div style={{ padding: '72px 48px', borderRight: `1px solid ${T.border}` }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: T.amberBg, border: `1px solid ${T.amberBorder}`, color: T.amberText, padding: '4px 12px', borderRadius: 99, fontSize: 11, fontWeight: 500, marginBottom: 24 }}>
            <div style={{ width: 5, height: 5, background: T.accent, borderRadius: '50%' }}></div>
            No credit card required
          </div>
          <h1 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 56, lineHeight: 1.05, color: T.heading, letterSpacing: '-2px', marginBottom: 20 }}>
            Your website,<br />finally <em style={{ color: T.accent, fontStyle: 'italic' }}>talks back</em>
          </h1>
          <p style={{ fontSize: 16, color: T.textSecondary, lineHeight: 1.75, marginBottom: 32 }}>
            Add a smart chatbot to any website in 60 seconds. Trained on your content. Works in any language. Powered by whichever AI you trust.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <Link to="/signup" style={{ background: T.accent, color: T.accentText, padding: '12px 24px', borderRadius: 8, fontSize: 15, fontWeight: 600, textDecoration: 'none' }}>Build your first bot free</Link>
            <a href="#how" style={{ fontSize: 14, color: T.textSecondary, textDecoration: 'none' }}>See how it works →</a>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr 1fr' }}>
          {[
            { num: '60s', label: 'From signup to live chatbot' },
            { num: 'Any AI', label: 'Groq, Claude, GPT-4, Gemini' },
            { num: '100+', label: 'Languages understood' },
            { num: '0 code', label: 'Needed to embed on your site' },
          ].map((item, i) => (
            <div key={i} style={{ padding: '36px 32px', borderBottom: i < 2 ? `1px solid ${T.border}` : 'none', borderRight: i % 2 === 0 ? `1px solid ${T.border}` : 'none' }}>
              <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 36, color: T.accent, lineHeight: 1, marginBottom: 8 }}>{item.num}</div>
              <div style={{ fontSize: 13, color: T.textMuted, lineHeight: 1.5 }}>{item.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* How it works */}
      <div id="how" style={{ padding: '56px 48px', borderBottom: `1px solid ${T.border}` }}>
        <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.12em', color: T.textMuted, textTransform: 'uppercase', marginBottom: 32 }}>How it works</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 1, background: T.border, border: `1px solid ${T.border}`, borderRadius: 12, overflow: 'hidden' }}>
          {[
            { num: '01', title: 'Paste your content', desc: 'Add your FAQs, policies, or any text. CommitBot learns from it automatically.' },
            { num: '02', title: 'Customize the look', desc: 'Match your brand colors. Your chatbot, your identity. Not ours.' },
            { num: '03', title: 'Embed anywhere', desc: 'One line of code. Works on WordPress, Shopify, or any custom HTML.' },
          ].map((step, i) => (
            <div key={i} style={{ padding: '32px 28px', background: T.bg }}>
              <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 48, color: T.border, lineHeight: 1, marginBottom: 16 }}>{step.num}</div>
              <div style={{ fontSize: 15, fontWeight: 600, color: T.text, marginBottom: 10 }}>{step.title}</div>
              <div style={{ fontSize: 13, color: T.textSecondary, lineHeight: 1.75 }}>{step.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Features */}
      <div id="features" style={{ padding: '56px 48px', borderBottom: `1px solid ${T.border}` }}>
        <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.12em', color: T.textMuted, textTransform: 'uppercase', marginBottom: 32 }}>Features</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 1, background: T.border, border: `1px solid ${T.border}`, borderRadius: 12, overflow: 'hidden' }}>
          {[
            { title: 'Bring your own AI key', desc: 'Use Groq, Claude, GPT-4, Gemini. We never see your key. Ever.' },
            { title: 'AES-256 encryption', desc: 'Your API key is encrypted before it touches our database. We literally cannot read it.' },
            { title: 'Smart keyword matching', desc: 'No AI budget? Our keyword engine with synonyms handles most questions perfectly.' },
            { title: 'Any language', desc: 'Visitor writes in Hindi, Telugu, French — the bot replies in the same language.' },
            { title: 'Full appearance control', desc: 'Colors, logo, greeting. Your widget looks like yours, not ours.' },
            { title: 'One line embed', desc: 'Copy one script tag. Paste anywhere. Chat bubble appears instantly.' },
          ].map((f, i) => (
            <div key={i} style={{ padding: '28px', background: T.bg, borderTop: i >= 3 ? `1px solid ${T.border}` : 'none' }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: T.text, marginBottom: 8 }}>{f.title}</div>
              <div style={{ fontSize: 13, color: T.textSecondary, lineHeight: 1.75 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Pricing 
      <div id="pricing" style={{ padding: '56px 48px', borderBottom: `1px solid ${T.border}` }}>
        <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.12em', color: T.textMuted, textTransform: 'uppercase', marginBottom: 12 }}>Pricing</p>
        <h2 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 40, color: T.heading, letterSpacing: '-0.5px', marginBottom: 32 }}>Simple. No surprises.</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
          {[
            { name: 'Free', price: '$0', period: 'forever', featured: false, features: ['1 chatbot', 'Keyword matching', 'Basic customization', 'CommitBot branding'], cta: 'Get started' },
            { name: 'Starter — most popular', price: '$19', period: '/month', featured: true, features: ['3 chatbots', 'Bring your own AI key', 'Full customization', 'Remove branding'], cta: 'Start free trial' },
            { name: 'Pro', price: '$49', period: '/month', featured: false, features: ['Unlimited bots', 'All AI providers', 'Analytics & exports', 'Priority support'], cta: 'Get Pro' },
          ].map((plan, i) => (
            <div key={i} style={{ border: plan.featured ? `1px solid ${T.accent}` : `1px solid ${T.border}`, borderRadius: 12, padding: '28px', background: T.cardBg, display: 'flex', flexDirection: 'column' }}>
              <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: T.textMuted, marginBottom: 14 }}>{plan.name}</div>
              <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 44, color: plan.featured ? T.accent : T.heading, lineHeight: 1, marginBottom: 4 }}>{plan.price}</div>
              <div style={{ fontSize: 12, color: T.textMuted, marginBottom: 20 }}>{plan.period}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
                {plan.features.map((f, j) => (
                  <div key={j} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: T.textSecondary }}>
                    <div style={{ width: 4, height: 4, borderRadius: '50%', background: plan.featured ? T.accent : T.textMuted, flexShrink: 0 }}></div>
                    {f}
                  </div>
                ))}
              </div>
              <Link to="/signup" style={{ display: 'block', marginTop: 24, padding: '11px 0', borderRadius: 8, fontSize: 14, fontWeight: 600, textAlign: 'center', textDecoration: 'none', background: plan.featured ? T.accent : 'transparent', color: plan.featured ? T.accentText : T.text, border: plan.featured ? 'none' : `1px solid ${T.border}` }}>
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>
      */}

      {/* CTA */}
      <div style={{ padding: '72px 48px', textAlign: 'center', borderBottom: `1px solid ${T.border}`, background: T.cardBg }}>
        <h2 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 48, color: T.heading, letterSpacing: '-1px', marginBottom: 12, lineHeight: 1.1 }}>
          Ready to make your website<br />
          <em style={{ color: T.accent, fontStyle: 'italic' }}>actually helpful?</em>
        </h2>
        <p style={{ fontSize: 14, color: T.textSecondary, marginBottom: 28 }}>Free to start. No credit card. Takes 60 seconds.</p>
        <Link to="/signup" style={{ display: 'inline-block', background: T.accent, color: T.accentText, padding: '13px 32px', borderRadius: 8, fontSize: 15, fontWeight: 600, textDecoration: 'none' }}>
          Build your first bot free →
        </Link>
      </div>

      {/* Footer */}
      <div style={{ padding: '24px 48px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 24, height: 24, background: T.accent, borderRadius: 5, display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.accentText, fontWeight: 700, fontSize: 11 }}>C</div>
          <span style={{ fontSize: 13, color: T.textMuted }}>CommitBot</span>
        </div>
        <div style={{ display: 'flex', gap: 24 }}>
          {['Privacy', 'Terms', 'Contact'].map(l => (
            <a key={l} href="#" style={{ fontSize: 12, color: T.textMuted, textDecoration: 'none' }}>{l}</a>
          ))}
        </div>
        <span style={{ fontSize: 12, color: T.textMuted }}>© 2026 CommitBot. All rights reserved.</span>
      </div>
    </div>
  )
}