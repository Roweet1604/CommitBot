import { createContext, useContext, useState } from 'react'

const ThemeContext = createContext()

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('theme')
    return saved ? saved === 'dark' : true
  })

  const toggleTheme = () => {
    setIsDark(prev => {
      const next = !prev
      localStorage.setItem('theme', next ? 'dark' : 'light')
      return next
    })
  }

  const theme = {
    isDark,
    toggleTheme,
    bg: isDark ? '#0C0C0C' : '#FAFAF8',
    bgSecondary: isDark ? '#111' : '#fff',
    bgTertiary: isDark ? '#1A1A1A' : '#F5F5F0',
    border: isDark ? '#1E1E1E' : '#E8E6E0',
    borderHover: isDark ? '#2A2A2A' : '#D0CEC8',
    text: isDark ? '#E8E6E0' : '#1A1A1A',
    textSecondary: isDark ? '#555' : '#6B6B6B',
    textMuted: isDark ? '#444' : '#9CA3AF',
    textTertiary: isDark ? '#333' : '#C4C2BC',
    heading: isDark ? '#F0EDE8' : '#0F0F0F',
    accent: '#F5A623',
    accentText: '#0C0C0C',
    navBg: isDark ? '#0C0C0C' : '#fff',
    cardBg: isDark ? '#111' : '#fff',
    inputBg: isDark ? '#0C0C0C' : '#FAFAF8',
    inputBorder: isDark ? '#1E1E1E' : '#E8E6E0',
    codeBg: isDark ? '#111' : '#F5F5F0',
    codeText: isDark ? '#4ADE80' : '#16A34A',
    dangerBg: isDark ? '#1A0A0A' : '#FEF2F2',
    dangerText: isDark ? '#EF4444' : '#DC2626',
    dangerBorder: isDark ? '#2A1A1A' : '#FECACA',
    successBg: isDark ? '#0A1F0A' : '#F0FDF4',
    successText: isDark ? '#4ADE80' : '#16A34A',
    successBorder: isDark ? '#1A4A1A' : '#BBF7D0',
    amberBg: isDark ? '#1A1A0A' : '#FEF3E2',
    amberText: isDark ? '#F5A623' : '#B45309',
    amberBorder: isDark ? '#2A2A1A' : '#FDE68A',
  }

  return (
    <ThemeContext.Provider value={theme}>
      <div style={{ background: theme.bg, minHeight: '100vh', transition: 'background 0.2s, color 0.2s' }}>
        {children}
      </div>
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)