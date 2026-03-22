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
const REDUCED_GRAPHICS_KEY = 'portfolio-reduced-graphics'
const StyleContext = createContext(null)

function shouldEnableReducedGraphicsByDefault() {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return false

  const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  const deviceMemory = navigator.deviceMemory ?? 8
  const hardwareConcurrency = navigator.hardwareConcurrency ?? 8
  const platform = navigator.userAgentData?.platform || navigator.platform || navigator.userAgent || ''
  const isWindows = /Win/i.test(platform)
  const isMobile = window.innerWidth <= 768 || /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)

  if (prefersReducedMotion) return true
  if (deviceMemory <= 4 || hardwareConcurrency <= 4) return true
  if (isWindows && (deviceMemory <= 8 || hardwareConcurrency <= 8)) return true
  if (isMobile && deviceMemory <= 6) return true

  return false
}

export function StyleProvider({ children }) {
  const [currentStyle, setCurrentStyle] = useState(STYLES.LIQUID_GLASS)
  const [reducedGraphics, setReducedGraphics] = useState(false)
  const [reducedGraphicsAuto, setReducedGraphicsAuto] = useState(true)

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved === STYLES.TERMINAL || saved === STYLES.MACOS_DESKTOP || saved === STYLES.LIQUID_GLASS) {
      setCurrentStyle(saved)
    } else {
      setCurrentStyle(STYLES.LIQUID_GLASS)
      localStorage.setItem(STORAGE_KEY, STYLES.LIQUID_GLASS)
    }

    const savedReducedGraphics = localStorage.getItem(REDUCED_GRAPHICS_KEY)
    if (savedReducedGraphics === 'true' || savedReducedGraphics === 'false') {
      setReducedGraphics(savedReducedGraphics === 'true')
      setReducedGraphicsAuto(false)
    } else {
      setReducedGraphics(shouldEnableReducedGraphicsByDefault())
      setReducedGraphicsAuto(true)
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

  const toggleReducedGraphics = useCallback(() => {
    setReducedGraphics((prev) => {
      const next = !prev
      localStorage.setItem(REDUCED_GRAPHICS_KEY, String(next))
      setReducedGraphicsAuto(false)
      return next
    })
  }, [])

  const value = {
    currentStyle,
    reducedGraphics,
    reducedGraphicsAuto,
    showLanding: false,
    isFirstVisit: false,
    styles: STYLES,
    styleInfo: STYLE_INFO,
    styleList: [STYLE_INFO[STYLES.TERMINAL], STYLE_INFO[STYLES.MACOS_DESKTOP]],
    selectStyle,
    toggleReducedGraphics,
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
