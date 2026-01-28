import { useStyle } from '../../contexts/StyleContext'
import './LandingPage.css'

export default function LandingPage() {
  const { styleList, selectStyle } = useStyle()

  return (
    <div className="landing-page">
      <div className="landing-background">
        <div className="landing-gradient"></div>
        <div className="landing-particles"></div>
      </div>

      <div className="landing-content">
        <header className="landing-header">
          <h1 className="landing-title">Taeho Je</h1>
          <p className="landing-subtitle">Choose your experience</p>
        </header>

        <div className="style-grid">
          {styleList.map((style) => (
            <button
              key={style.id}
              className={`style-card ${style.recommended ? 'recommended' : ''}`}
              onClick={() => selectStyle(style.id)}
            >
              <span className="style-icon">{style.icon}</span>
              <h3 className="style-name">{style.name}</h3>
              <p className="style-description">{style.description}</p>
              {style.recommended && (
                <span className="recommended-badge">Recommended</span>
              )}
            </button>
          ))}
        </div>

        <footer className="landing-footer">
          <p>Select a style to explore my portfolio</p>
        </footer>
      </div>
    </div>
  )
}
