import { useEffect, useRef, useState } from 'react'
import { STYLES, useStyle } from '../contexts/StyleContext'
import './StyleSwitcher.css'

export default function StyleSwitcher() {
  const [isOpen, setIsOpen] = useState(false)
  const panelRef = useRef(null)
  const {
    styleList,
    currentStyle,
    selectStyle,
    reducedGraphics,
    reducedGraphicsAuto,
    reducedGraphicsReason,
    toggleReducedGraphics,
    resetReducedGraphicsAuto
  } = useStyle()

  useEffect(() => {
    if (!isOpen) return undefined

    const closeOutside = (event) => {
      if (!panelRef.current?.contains(event.target)) setIsOpen(false)
    }

    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setIsOpen(false)
    }

    document.addEventListener('pointerdown', closeOutside)
    document.addEventListener('keydown', closeOnEscape)
    return () => {
      document.removeEventListener('pointerdown', closeOutside)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [isOpen])

  return (
    <div className={`style-switcher ${isOpen ? 'open' : ''}`} ref={panelRef}>
      <button
        className="style-switcher-toggle"
        onClick={() => setIsOpen((value) => !value)}
        aria-label="Open portfolio appearance settings"
        aria-expanded={isOpen}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M12 3v2.2M12 18.8V21M3 12h2.2M18.8 12H21M5.64 5.64 7.2 7.2M16.8 16.8l1.56 1.56M18.36 5.64 16.8 7.2M7.2 16.8l-1.56 1.56" />
          <circle cx="12" cy="12" r="4.1" />
        </svg>
      </button>

      {isOpen && (
        <div className="style-switcher-menu">
          <div className="style-switcher-header">
            <div>
              <span className="style-switcher-eyebrow">Portfolio system</span>
              <h3>Choose a view</h3>
            </div>
            <button className="style-switcher-close" onClick={() => setIsOpen(false)} aria-label="Close settings">×</button>
          </div>

          <div className="style-switcher-list">
            {styleList.map((style) => (
              <button
                key={style.id}
                className={`style-switcher-item ${currentStyle === style.id ? 'active' : ''}`}
                onClick={() => {
                  selectStyle(style.id)
                  setIsOpen(false)
                }}
              >
                <span className="style-switcher-icon">{style.icon}</span>
                <span className="style-switcher-copy">
                  <span className="style-switcher-name">{style.name}</span>
                  <span className="style-switcher-description">{style.description}</span>
                </span>
                <span className="style-switcher-check">{currentStyle === style.id ? '●' : '○'}</span>
              </button>
            ))}
          </div>

          {currentStyle === STYLES.LIQUID_GLASS && (
            <div className="graphics-control">
              <button
                className={`reduced-graphics-toggle ${reducedGraphics ? 'active' : ''}`}
                onClick={toggleReducedGraphics}
                type="button"
              >
                <span className="reduced-graphics-copy">
                  <span className="reduced-graphics-label">Reduced graphics</span>
                  <span className="reduced-graphics-desc">
                    {reducedGraphics ? 'Glass preserved, rendering load reduced' : 'Full motion and maximum optical detail'}
                  </span>
                </span>
                <span className={`reduced-graphics-switch ${reducedGraphics ? 'on' : ''}`}>
                  <span className="reduced-graphics-knob" />
                </span>
              </button>

              <div className="graphics-mode-meta">
                <span>{reducedGraphicsAuto ? `AUTO · ${reducedGraphicsReason}` : 'MANUAL'}</span>
                {!reducedGraphicsAuto && (
                  <button type="button" onClick={resetReducedGraphicsAuto}>Use auto</button>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
