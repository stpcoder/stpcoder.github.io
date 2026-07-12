import { useEffect, useRef, useState } from 'react'
import { STYLES, useStyle } from '../contexts/StyleContext'
import './StyleSwitcher.css'

const VIEW_MARKS = {
  [STYLES.LIQUID_GLASS]: 'LG',
  [STYLES.TERMINAL]: '>_',
  [STYLES.MACOS_DESKTOP]: '⌘',
  [STYLES.BLUEPRINT]: '+',
  [STYLES.SNAKE]: 'AR'
}

export default function StyleSwitcher() {
  const [isOpen, setIsOpen] = useState(false)
  const switcherRef = useRef(null)
  const {
    styleList,
    currentStyle,
    selectStyle,
    reducedGraphics,
    reducedGraphicsAuto,
    setReducedGraphicsMode
  } = useStyle()

  useEffect(() => {
    if (!isOpen) return undefined
    const close = (event) => {
      if (event.type === 'keydown' && event.key !== 'Escape') return
      if (event.type === 'pointerdown' && switcherRef.current?.contains(event.target)) return
      setIsOpen(false)
    }
    document.addEventListener('pointerdown', close)
    document.addEventListener('keydown', close)
    return () => {
      document.removeEventListener('pointerdown', close)
      document.removeEventListener('keydown', close)
    }
  }, [isOpen])

  const graphicsMode = reducedGraphicsAuto ? 'auto' : reducedGraphics ? 'reduced' : 'full'

  return (
    <div className={`view-switcher ${isOpen ? 'open' : ''}`} ref={switcherRef}>
      {isOpen && (
        <div className="view-switcher-panel" aria-label="Portfolio views">
          <div className="view-switcher-list">
            {styleList.map((style, index) => (
              <button
                type="button"
                key={style.id}
                data-view={style.id}
                className={currentStyle === style.id ? 'active' : ''}
                style={{ '--view-index': index }}
                onClick={() => {
                  selectStyle(style.id)
                  setIsOpen(false)
                }}
              >
                <span className="view-mark">{VIEW_MARKS[style.id]}</span>
                <strong>{style.name}</strong>
                <i />
              </button>
            ))}
          </div>

          {currentStyle === STYLES.LIQUID_GLASS && (
            <div className="view-graphics-control" aria-label="Liquid Glass graphics quality">
              {[
                ['auto', 'Auto'],
                ['full', 'Full'],
                ['reduced', 'Lite']
              ].map(([mode, label]) => (
                <button type="button" key={mode} className={graphicsMode === mode ? 'active' : ''} onClick={() => setReducedGraphicsMode(mode)}>{label}</button>
              ))}
            </div>
          )}
        </div>
      )}

      <button
        type="button"
        className="view-switcher-trigger"
        onClick={() => setIsOpen((value) => !value)}
        aria-label="Change portfolio view"
        aria-expanded={isOpen}
      >
        <span className="view-aperture" aria-hidden="true"><i /><i /><i /><i /></span>
      </button>
    </div>
  )
}
