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

export default function NewspaperView() {
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  })

  const skills = resumeData.skills?.programming?.map(s => s.name) || []
  const technologies = resumeData.skills?.technologies?.map(s => s.name) || []

  // Breaking news items
  const breakingNews = [
    `${getText(resumeData.personal.name)} wins Kakao AI TOP 100 Grand Prize`,
    `Featured in KBS Documentary "Nobel Week"`,
    `Excellence Award at SK Hynix internship presentation`,
    `K-Startup 2023 Excellence Award (Minister of National Defense)`,
  ]

  return (
    <div className="newspaper-view">
      {/* Breaking News Ticker */}
      <div className="breaking-ticker">
        <span className="breaking-label">BREAKING</span>
        <div className="ticker-wrapper">
          <div className="ticker-content">
            {breakingNews.map((news, i) => (
              <span key={i} className="ticker-item">
                {news}
                <span className="ticker-separator">•</span>
              </span>
            ))}
            {/* Duplicate for seamless loop */}
            {breakingNews.map((news, i) => (
              <span key={`dup-${i}`} className="ticker-item">
                {news}
                <span className="ticker-separator">•</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      <header className="newspaper-header">
        <div className="newspaper-date">{today}</div>
        <h1 className="newspaper-title">THE PORTFOLIO TIMES</h1>
        <div className="newspaper-tagline">All the news that's fit to code</div>
      </header>

      <main className="newspaper-content">
        <article className="headline-article">
          <span className="exclusive-badge">EXCLUSIVE</span>
          <h2>BREAKING: {getText(resumeData.personal.name)} Revolutionizes Tech Industry</h2>
          <p className="byline">By Our Technology Correspondent</p>
          <p>{getText(resumeData.personal.title)} based in {getText(resumeData.personal.location)} has been making waves in the technology sector with groundbreaking work in AI and software development.</p>
          <p className="article-continue">{getText(resumeData.about)}</p>
        </article>

        <aside className="sidebar">
          <div className="sidebar-section">
            <h3>EDUCATION</h3>
            {getFeaturedItems(resumeData.education).map((edu, i) => (
              <p key={i}><strong>{getText(edu.institution)}</strong><br />{getText(edu.degree)}</p>
            ))}
          </div>
          <div className="sidebar-section">
            <h3>EXPERIENCE</h3>
            {getFeaturedItems(resumeData.experience).slice(0, 3).map((exp, i) => (
              <div key={i} className="sidebar-item">
                <strong>{getText(exp.company)}</strong>
                <span className="sidebar-role">{getText(exp.position)}</span>
              </div>
            ))}
          </div>
          <div className="sidebar-section">
            <h3>CONTACT</h3>
            <p>{resumeData.personal.email}</p>
          </div>
        </aside>

        <article className="secondary-article">
          <h3>Skills & Expertise</h3>
          <p><strong>Languages:</strong> {skills.join(', ')}</p>
          <p><strong>Technologies:</strong> {technologies.join(', ')}</p>
        </article>

        {/* Featured Awards Section */}
        <section className="awards-section">
          <h3>AWARDS & ACHIEVEMENTS</h3>
          <div className="awards-grid">
            {resumeData.awards?.map(category =>
              getFeaturedItems(category.items).slice(0, 2).map((award, i) => (
                <div key={`${category.category}-${i}`} className="award-card">
                  <span className="award-year">{award.year}</span>
                  <h4>{getText(award.title)}</h4>
                  <p>{getText(award.organization)}</p>
                </div>
              ))
            )}
          </div>
        </section>
      </main>

      <StyleSwitcher />
      <style>{`
        .newspaper-view {
          min-height: 100vh;
          background: #f4f1ea;
          font-family: 'Times New Roman', Georgia, serif;
        }

        /* Breaking News Ticker */
        .breaking-ticker {
          background: #c00000;
          display: flex;
          align-items: center;
          overflow: hidden;
          height: 40px;
        }
        .breaking-label {
          background: #fff;
          color: #c00000;
          padding: 0.5rem 1rem;
          font-weight: 900;
          font-size: 0.85rem;
          letter-spacing: 0.05em;
          flex-shrink: 0;
          text-transform: uppercase;
          font-family: Arial, sans-serif;
        }
        .ticker-wrapper {
          flex: 1;
          overflow: hidden;
          position: relative;
        }
        .ticker-content {
          display: flex;
          white-space: nowrap;
          animation: ticker 30s linear infinite;
        }
        .ticker-item {
          color: white;
          font-size: 0.9rem;
          padding: 0 0.5rem;
          font-family: Arial, sans-serif;
        }
        .ticker-separator {
          margin: 0 1rem;
          opacity: 0.7;
        }
        @keyframes ticker {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        .newspaper-header {
          text-align: center;
          border-bottom: 3px double #000;
          padding: 1.5rem 2rem;
          max-width: 1200px;
          margin: 0 auto;
          background: #f4f1ea;
        }
        .newspaper-date {
          font-size: 0.9rem;
          color: #666;
        }
        .newspaper-title {
          font-size: 3.5rem;
          font-weight: 900;
          letter-spacing: 0.1em;
          margin: 0.5rem 0;
        }
        .newspaper-tagline {
          font-style: italic;
          color: #666;
        }
        .newspaper-content {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem;
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 2rem;
        }
        .headline-article {
          position: relative;
        }
        .exclusive-badge {
          display: inline-block;
          background: #c00000;
          color: white;
          padding: 0.25rem 0.75rem;
          font-size: 0.75rem;
          font-weight: 700;
          font-family: Arial, sans-serif;
          letter-spacing: 0.05em;
          margin-bottom: 0.75rem;
        }
        .headline-article h2 {
          font-size: 2rem;
          line-height: 1.2;
          margin-bottom: 1rem;
        }
        .byline {
          font-style: italic;
          color: #666;
          margin-bottom: 1rem;
        }
        .article-continue {
          margin-top: 1rem;
          line-height: 1.8;
          color: #333;
        }
        .sidebar {
          border-left: 1px solid #ccc;
          padding-left: 1.5rem;
        }
        .sidebar-section {
          margin-bottom: 2rem;
        }
        .sidebar-section h3 {
          font-size: 1rem;
          border-bottom: 2px solid #000;
          padding-bottom: 0.5rem;
          margin-bottom: 1rem;
        }
        .sidebar-item {
          margin-bottom: 0.75rem;
        }
        .sidebar-role {
          display: block;
          font-size: 0.9rem;
          color: #555;
          font-style: italic;
        }
        .secondary-article {
          grid-column: span 2;
          border-top: 1px solid #ccc;
          padding-top: 1.5rem;
          columns: 2;
          column-gap: 2rem;
        }
        .secondary-article h3 {
          column-span: all;
          margin-bottom: 1rem;
          font-size: 1.5rem;
        }

        /* Awards Section */
        .awards-section {
          grid-column: span 2;
          border-top: 1px solid #ccc;
          padding-top: 1.5rem;
          margin-top: 1rem;
        }
        .awards-section h3 {
          font-size: 1.25rem;
          border-bottom: 2px solid #000;
          padding-bottom: 0.5rem;
          margin-bottom: 1.5rem;
          display: inline-block;
        }
        .awards-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.5rem;
        }
        .award-card {
          background: #fff;
          padding: 1.25rem;
          border: 1px solid #ddd;
          position: relative;
        }
        .award-year {
          position: absolute;
          top: 0.75rem;
          right: 0.75rem;
          background: #000;
          color: #fff;
          padding: 0.15rem 0.5rem;
          font-size: 0.75rem;
          font-family: Arial, sans-serif;
        }
        .award-card h4 {
          font-size: 0.95rem;
          margin: 0 0 0.5rem;
          line-height: 1.4;
          padding-right: 3rem;
        }
        .award-card p {
          font-size: 0.85rem;
          color: #666;
          margin: 0;
        }

        @media (max-width: 768px) {
          .newspaper-title {
            font-size: 2rem;
          }
          .newspaper-content {
            grid-template-columns: 1fr;
            padding: 1rem;
          }
          .sidebar {
            border-left: none;
            border-top: 1px solid #ccc;
            padding-left: 0;
            padding-top: 1.5rem;
          }
          .secondary-article {
            columns: 1;
          }
          .awards-grid {
            grid-template-columns: 1fr;
          }
          .breaking-ticker {
            height: 36px;
          }
          .breaking-label {
            font-size: 0.75rem;
            padding: 0.4rem 0.75rem;
          }
          .ticker-item {
            font-size: 0.8rem;
          }
        }
      `}</style>
    </div>
  )
}
