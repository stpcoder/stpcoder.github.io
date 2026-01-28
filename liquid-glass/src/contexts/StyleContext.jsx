import { createContext, useContext, useState, useEffect, useCallback } from 'react'

const STYLES = {
  LIQUID_GLASS: 'liquid-glass',
  TERMINAL: 'terminal',
  GALAXY_SCROLL: 'galaxy-scroll',
  CLASSIC_RESUME: 'classic-resume',
  NEWSPAPER: 'newspaper',
  CINEMATIC_SCROLL: 'cinematic-scroll',
  KOREAN_NEWSPAPER: 'korean-newspaper',
  MACOS_DESKTOP: 'macos-desktop'
}

const STYLE_INFO = {
  [STYLES.LIQUID_GLASS]: {
    id: STYLES.LIQUID_GLASS,
    name: 'Liquid Glass',
    icon: '✨',
    description: '3D floating glass bubbles with neon lighting',
    recommended: true
  },
  [STYLES.TERMINAL]: {
    id: STYLES.TERMINAL,
    name: 'Terminal',
    icon: '💻',
    description: 'Retro terminal with typing animation'
  },
  [STYLES.GALAXY_SCROLL]: {
    id: STYLES.GALAXY_SCROLL,
    name: 'Galaxy Scroll',
    icon: '🌌',
    description: 'Parallax timeline with starfield'
  },
  [STYLES.CLASSIC_RESUME]: {
    id: STYLES.CLASSIC_RESUME,
    name: 'Classic Resume',
    icon: '📄',
    description: 'Traditional resume with PDF export'
  },
  [STYLES.NEWSPAPER]: {
    id: STYLES.NEWSPAPER,
    name: 'Newspaper',
    icon: '📰',
    description: 'Classic newspaper layout with breaking news'
  },
  [STYLES.CINEMATIC_SCROLL]: {
    id: STYLES.CINEMATIC_SCROLL,
    name: 'Cinematic',
    icon: '🎬',
    description: 'Scroll-driven animations with parallax effects'
  },
  [STYLES.KOREAN_NEWSPAPER]: {
    id: STYLES.KOREAN_NEWSPAPER,
    name: 'Newspaper (Korean)',
    icon: '🇰🇷',
    description: 'Modern Korean news site layout'
  },
  [STYLES.MACOS_DESKTOP]: {
    id: STYLES.MACOS_DESKTOP,
    name: 'macOS Desktop',
    icon: '🖥️',
    description: 'Interactive desktop with draggable windows'
  }
}

const STORAGE_KEY = 'portfolio-style-preference'

const StyleContext = createContext(null)

export function StyleProvider({ children }) {
  const [currentStyle, setCurrentStyle] = useState(null)
  const [showLanding, setShowLanding] = useState(true)
  const [isFirstVisit, setIsFirstVisit] = useState(true)

  // Load saved preference on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved && STYLE_INFO[saved]) {
      setCurrentStyle(saved)
      setShowLanding(false)
      setIsFirstVisit(false)
    }
  }, [])

  const selectStyle = useCallback((styleId) => {
    if (STYLE_INFO[styleId]) {
      setCurrentStyle(styleId)
      setShowLanding(false)
      localStorage.setItem(STORAGE_KEY, styleId)
    }
  }, [])

  const goToLanding = useCallback(() => {
    setShowLanding(true)
  }, [])

  const clearPreference = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    setCurrentStyle(null)
    setShowLanding(true)
    setIsFirstVisit(true)
  }, [])

  const value = {
    currentStyle,
    showLanding,
    isFirstVisit,
    styles: STYLES,
    styleInfo: STYLE_INFO,
    styleList: Object.values(STYLE_INFO),
    selectStyle,
    goToLanding,
    clearPreference
  }

  return (
    <StyleContext.Provider value={value}>
      {children}
    </StyleContext.Provider>
  )
}

export function useStyle() {
  const context = useContext(StyleContext)
  if (!context) {
    throw new Error('useStyle must be used within a StyleProvider')
  }
  return context
}

export { STYLES, STYLE_INFO }
