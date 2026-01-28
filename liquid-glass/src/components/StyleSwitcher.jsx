import { useState } from 'react'
import { useStyle } from '../contexts/StyleContext'
import './StyleSwitcher.css'

export default function StyleSwitcher() {
  const [isOpen, setIsOpen] = useState(false)
  const { styleList, currentStyle, selectStyle, goToLanding } = useStyle()

  return (
    <div className={`style-switcher ${isOpen ? 'open' : ''}`}>
      <button
        className="style-switcher-toggle"
        onClick={() => setIsOpen(!isOpen)}
        title="Change Style"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="3"/>
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
        </svg>
      </button>

      {isOpen && (
        <div className="style-switcher-menu">
          <div className="style-switcher-header">
            <h3>Choose Style</h3>
            <button onClick={() => setIsOpen(false)}>×</button>
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
                <span className="style-switcher-name">{style.name}</span>
              </button>
            ))}
          </div>
          <button className="style-switcher-landing" onClick={goToLanding}>
            ← Back to Landing
          </button>
        </div>
      )}
    </div>
  )
}
