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

export default function ClassicResumeView() {
  const skills = resumeData.skills?.programming?.map(s => s.name) || []
  const technologies = resumeData.skills?.technologies?.map(s => s.name) || []

  return (
    <div className="classic-resume-view">
      <div className="resume-paper">
        <header className="resume-header">
          <h1>{getText(resumeData.personal.name)}</h1>
          <p className="title">{getText(resumeData.personal.title)}</p>
          <div className="contact-info">
            <span>{resumeData.personal.email}</span>
            <span>•</span>
            <span>{getText(resumeData.personal.location)}</span>
          </div>
        </header>

        <section className="resume-section">
          <h2>Education</h2>
          {getFeaturedItems(resumeData.education).map((edu, i) => (
            <div key={i} className="resume-item">
              <div className="item-header">
                <strong>{getText(edu.institution)}</strong>
                <span>{edu.period}</span>
              </div>
              <p>{getText(edu.degree)}</p>
            </div>
          ))}
        </section>

        <section className="resume-section">
          <h2>Experience</h2>
          {getFeaturedItems(resumeData.experience).map((exp, i) => (
            <div key={i} className="resume-item">
              <div className="item-header">
                <strong>{getText(exp.company)}</strong>
                <span>{exp.period}</span>
              </div>
              <p className="position">{getText(exp.position)}</p>
              {exp.description && <p>{getText(exp.description)}</p>}
            </div>
          ))}
        </section>

        <section className="resume-section">
          <h2>Skills</h2>
          <div className="skills-grid">
            <div>
              <strong>Programming:</strong> {skills.join(', ')}
            </div>
            <div>
              <strong>Technologies:</strong> {technologies.join(', ')}
            </div>
          </div>
        </section>
      </div>
      <StyleSwitcher />
      <style>{`
        .classic-resume-view {
          height: 100vh;
          overflow-y: auto;
          background: #e0e0e0;
          padding: 2rem;
          box-sizing: border-box;
        }
        .resume-paper {
          width: 100%;
          max-width: 800px;
          margin: 0 auto;
          background: white;
          padding: 3rem;
          box-shadow: 0 4px 20px rgba(0,0,0,0.1);
          font-family: 'Georgia', serif;
          color: #333;
          margin-bottom: 2rem;
        }
        .resume-header {
          text-align: center;
          border-bottom: 2px solid #333;
          padding-bottom: 1.5rem;
          margin-bottom: 2rem;
        }
        .resume-header h1 {
          font-size: 2.5rem;
          margin: 0;
          letter-spacing: 0.1em;
        }
        .resume-header .title {
          font-size: 1.1rem;
          color: #666;
          margin: 0.5rem 0;
        }
        .contact-info {
          font-size: 0.9rem;
          color: #666;
          display: flex;
          justify-content: center;
          gap: 1rem;
        }
        .resume-section {
          margin-bottom: 2rem;
        }
        .resume-section h2 {
          font-size: 1.2rem;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          border-bottom: 1px solid #ccc;
          padding-bottom: 0.5rem;
          margin-bottom: 1rem;
        }
        .resume-item {
          margin-bottom: 1.5rem;
        }
        .item-header {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
        }
        .item-header span {
          color: #666;
          font-size: 0.9rem;
        }
        .position {
          font-style: italic;
          color: #555;
          margin: 0.25rem 0;
        }
        .skills-grid {
          display: grid;
          gap: 0.75rem;
        }
        @media (max-width: 768px) {
          .resume-paper {
            padding: 1.5rem;
          }
          .item-header {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  )
}
