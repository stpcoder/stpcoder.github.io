/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, useCallback } from 'react'

const STYLES = {
  LIQUID_GLASS: 'liquid-glass',
  TERMINAL: 'terminal',
  MACOS_DESKTOP: 'macos-desktop',
  REALITY_LAB: 'reality-lab',
  BLUEPRINT: 'blueprint',
  SNAKE: 'snake'
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
    description: 'Interactive shell for browsing portfolio records'
  },
  [STYLES.MACOS_DESKTOP]: {
    id: STYLES.MACOS_DESKTOP,
    name: 'macOS Desktop',
    icon: '🖥️',
    description: 'macOS Finder with folders, search, and Quick Look'
  },
  [STYLES.REALITY_LAB]: {
    id: STYLES.REALITY_LAB,
    name: 'Reality Lab',
    icon: '✎',
    description: 'Sketch-to-reality journey through Taeho\'s defining work'
  },
  [STYLES.BLUEPRINT]: {
    id: STYLES.BLUEPRINT,
    name: 'Blueprint',
    icon: '⌗',
    description: 'Technical plan view for category scanning'
  },
  [STYLES.SNAKE]: {
    id: STYLES.SNAKE,
    name: 'Arcade',
    icon: 'AR',
    description: 'Playable portfolio games with permanent expandable records'
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
  const saveData = navigator.connection?.saveData === true
  const platform = navigator.userAgentData?.platform || navigator.platform || navigator.userAgent || ''
  const isWindows = /Win/i.test(platform)
  const isMobile = window.innerWidth <= 768 || /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)

  if (prefersReducedMotion || saveData || isMobile) return true
  if (deviceMemory <= 4 || hardwareConcurrency <= 4) return true
  if (isWindows && (deviceMemory <= 8 || hardwareConcurrency <= 8)) return true

  return false
}

function getSavedStyle() {
  if (typeof window === 'undefined') return STYLES.LIQUID_GLASS
  const requested = new URLSearchParams(window.location.search).get('style')
  if (STYLE_INFO[requested]) return requested
  const saved = localStorage.getItem(STORAGE_KEY)
  return STYLE_INFO[saved] ? saved : STYLES.LIQUID_GLASS
}

function getSavedGraphicsPreference() {
  if (typeof window === 'undefined') {
    return { reduced: false, automatic: true, reason: 'default' }
  }

  const saved = localStorage.getItem(REDUCED_GRAPHICS_KEY)
  if (saved === 'true' || saved === 'false') {
    return {
      reduced: saved === 'true',
      automatic: false,
      reason: 'manual'
    }
  }

  return {
    reduced: shouldEnableReducedGraphicsByDefault(),
    automatic: true,
    reason: 'device'
  }
}

export function StyleProvider({ children }) {
  const [initialGraphics] = useState(getSavedGraphicsPreference)
  const [currentStyle, setCurrentStyle] = useState(getSavedStyle)
  const [reducedGraphics, setReducedGraphics] = useState(initialGraphics.reduced)
  const [reducedGraphicsAuto, setReducedGraphicsAuto] = useState(initialGraphics.automatic)
  const [reducedGraphicsReason, setReducedGraphicsReason] = useState(initialGraphics.reason)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, currentStyle)
  }, [currentStyle])

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
      setReducedGraphicsReason('manual')
      return next
    })
  }, [])

  const requestReducedGraphics = useCallback((reason = 'performance') => {
    if (!reducedGraphicsAuto) return
    setReducedGraphics(true)
    setReducedGraphicsReason(reason)
  }, [reducedGraphicsAuto])

  const resetReducedGraphicsAuto = useCallback(() => {
    localStorage.removeItem(REDUCED_GRAPHICS_KEY)
    setReducedGraphicsAuto(true)
    setReducedGraphics(shouldEnableReducedGraphicsByDefault())
    setReducedGraphicsReason('device')
  }, [])

  const setReducedGraphicsMode = useCallback((mode) => {
    if (mode === 'auto') {
      localStorage.removeItem(REDUCED_GRAPHICS_KEY)
      setReducedGraphicsAuto(true)
      setReducedGraphics(shouldEnableReducedGraphicsByDefault())
      setReducedGraphicsReason('device')
      return
    }

    const reduced = mode === 'reduced'
    localStorage.setItem(REDUCED_GRAPHICS_KEY, String(reduced))
    setReducedGraphics(reduced)
    setReducedGraphicsAuto(false)
    setReducedGraphicsReason('manual')
  }, [])

  const value = {
    currentStyle,
    reducedGraphics,
    reducedGraphicsAuto,
    reducedGraphicsReason,
    showLanding: false,
    isFirstVisit: false,
    styles: STYLES,
    styleInfo: STYLE_INFO,
    styleList: Object.values(STYLE_INFO),
    selectStyle,
    toggleReducedGraphics,
    requestReducedGraphics,
    resetReducedGraphicsAuto,
    setReducedGraphicsMode,
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
