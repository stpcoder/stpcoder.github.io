import StyleSwitcher from '../StyleSwitcher'
import resumeData from '../../data/resume-data.json'

// Helper to get text from multilingual field
const getText = (field, lang = 'en') => {
  if (typeof field === 'string') return field
  if (field && typeof field === 'object') return field[lang] || field.en || field.ko || ''
  return ''
}

// Get featured items only
const getFeaturedItems = (items) => items?.filter(item => item.featured !== false) || []

export default function CinematicScrollView() {
  const skills = resumeData.skills?.programming?.map(s => s.name) || []

  return (
    <div className="cinematic-view">
      <section className="cinematic-section intro">
        <div className="cinematic-overlay"></div>
        <div className="cinematic-text">
          <h1>{getText(resumeData.personal.name)}</h1>
          <p>{getText(resumeData.personal.title)}</p>
        </div>
      </section>

      <section className="cinematic-section">
        <h2>The Journey Begins</h2>
        <div className="cinematic-cards">
          {getFeaturedItems(resumeData.education).map((edu, i) => (
            <div key={i} className="cinematic-card">
              <h3>{getText(edu.institution)}</h3>
              <p>{getText(edu.degree)}</p>
              <span>{edu.period}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="cinematic-section dark">
        <h2>Experience</h2>
        <div className="cinematic-cards">
          {getFeaturedItems(resumeData.experience).map((exp, i) => (
            <div key={i} className="cinematic-card">
              <h3>{getText(exp.company)}</h3>
              <p>{getText(exp.position)}</p>
              <span>{exp.period}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="cinematic-section finale">
        <h2>Skills Acquired</h2>
        <div className="skill-bars">
          {skills.slice(0, 5).map((skill, i) => (
            <div key={i} className="skill-bar">
              <span>{skill}</span>
              <div className="bar"><div className="fill" style={{width: `${90 - i * 10}%`}}></div></div>
            </div>
          ))}
        </div>
      </section>

      <StyleSwitcher />
      <style>{`
        .cinematic-view {
          background: #000;
          color: white;
        }
        .cinematic-section {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          padding: 4rem 2rem;
          position: relative;
        }
        .cinematic-section.intro {
          background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
        }
        .cinematic-section.dark {
          background: #0a0a0a;
        }
        .cinematic-section.finale {
          background: linear-gradient(to top, #1a1a2e, #000);
        }
        .cinematic-overlay {
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at center, transparent 0%, rgba(0,0,0,0.5) 100%);
        }
        .cinematic-text {
          position: relative;
          text-align: center;
        }
        .cinematic-text h1 {
          font-size: 5rem;
          font-weight: 100;
          letter-spacing: 0.3em;
          margin: 0;
          animation: fadeIn 2s ease;
        }
        .cinematic-text p {
          font-size: 1.5rem;
          opacity: 0.7;
          letter-spacing: 0.2em;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .cinematic-section h2 {
          font-size: 2.5rem;
          font-weight: 300;
          letter-spacing: 0.2em;
          margin-bottom: 3rem;
          text-transform: uppercase;
        }
        .cinematic-cards {
          display: flex;
          gap: 2rem;
          flex-wrap: wrap;
          justify-content: center;
          max-width: 1200px;
        }
        .cinematic-card {
          background: rgba(255,255,255,0.05);
          padding: 2rem;
          border-radius: 4px;
          min-width: 280px;
          border: 1px solid rgba(255,255,255,0.1);
          transition: transform 0.3s ease;
        }
        .cinematic-card:hover {
          transform: translateY(-10px);
        }
        .cinematic-card h3 {
          margin: 0 0 0.5rem;
          font-weight: 400;
        }
        .cinematic-card p {
          opacity: 0.7;
          margin: 0 0 0.5rem;
        }
        .cinematic-card span {
          font-size: 0.85rem;
          opacity: 0.5;
        }
        .skill-bars {
          width: 100%;
          max-width: 600px;
        }
        .skill-bar {
          margin-bottom: 1.5rem;
        }
        .skill-bar span {
          display: block;
          margin-bottom: 0.5rem;
          letter-spacing: 0.1em;
        }
        .bar {
          height: 4px;
          background: rgba(255,255,255,0.1);
          border-radius: 2px;
        }
        .fill {
          height: 100%;
          background: linear-gradient(90deg, #4facfe, #00f2fe);
          border-radius: 2px;
          transition: width 1s ease;
        }
        @media (max-width: 768px) {
          .cinematic-text h1 { font-size: 2.5rem; letter-spacing: 0.1em; }
          .cinematic-section h2 { font-size: 1.5rem; }
        }
      `}</style>
    </div>
  )
}
