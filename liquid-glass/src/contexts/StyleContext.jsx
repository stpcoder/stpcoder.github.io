import { createContext, useContext, useState, useEffect, useCallback } from 'react'

const STYLES = {
  LIQUID_GLASS: 'liquid-glass',
  TERMINAL: 'terminal',
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
  const [currentStyle, setCurrentStyle] = useState(STYLES.LIQUID_GLASS)

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved === STYLES.TERMINAL || saved === STYLES.MACOS_DESKTOP || saved === STYLES.LIQUID_GLASS) {
      setCurrentStyle(saved)
    } else {
      setCurrentStyle(STYLES.LIQUID_GLASS)
      localStorage.setItem(STORAGE_KEY, STYLES.LIQUID_GLASS)
    }
  }, [])

  const selectStyle = useCallback((styleId) => {
    if (STYLE_INFO[styleId]) {
      setCurrentStyle(styleId)
      localStorage.setItem(STORAGE_KEY, styleId)
    }
  }, [])

  const goToLanding = useCallback(() => {
    setCurrentStyle(STYLES.LIQUID_GLASS)
    localStorage.setItem(STORAGE_KEY, STYLES.LIQUID_GLASS)
  }, [])

  const clearPreference = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    setCurrentStyle(STYLES.LIQUID_GLASS)
  }, [])

  const value = {
    currentStyle,
    showLanding: false,
    isFirstVisit: false,
    styles: STYLES,
    styleInfo: STYLE_INFO,
    styleList: [STYLE_INFO[STYLES.TERMINAL], STYLE_INFO[STYLES.MACOS_DESKTOP]],
    selectStyle,
    goToLanding,
    clearPreference
  }

  return <StyleContext.Provider value={value}>{children}</StyleContext.Provider>
}

export function useStyle() {
  const context = useContext(StyleContext)
  if (!context) throw new Error('useStyle must be used within a StyleProvider')
  return context
}

export { STYLES, STYLE_INFO }
