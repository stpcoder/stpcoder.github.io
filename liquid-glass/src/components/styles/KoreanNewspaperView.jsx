import { useState } from 'react'
import StyleSwitcher from '../StyleSwitcher'
import resumeData from '../../data/resume-data.json'

// Helper to get Korean text from multilingual field
const getText = (field, lang = 'ko') => {
  if (typeof field === 'string') return field
  if (field && typeof field === 'object') return field[lang] || field.ko || field.en || ''
  return ''
}

// Get featured items only
const getFeaturedItems = (items) => items?.filter(item => item.featured !== false) || []

export default function KoreanNewspaperView() {
  const [activeCategory, setActiveCategory] = useState('all')

  const today = new Date().toLocaleDateString('ko-KR', {
    year: 'numeric', month: 'long', day: 'numeric', weekday: 'long'
  })

  const categories = [
    { id: 'all', name: '전체' },
    { id: 'profile', name: '인물' },
    { id: 'education', name: '학력' },
    { id: 'career', name: '경력' },
    { id: 'projects', name: '프로젝트' },
    { id: 'skills', name: '기술' }
  ]

  // Extract skills from the new structure
  const programmingSkills = resumeData.skills?.programming?.map(s => s.name) || []
  const techSkills = resumeData.skills?.technologies?.map(s => s.name) || []

  return (
    <div className="kn-view">
      {/* Top Header Bar */}
      <div className="kn-top-bar">
        <div className="kn-top-content">
          <span className="kn-date">{today}</span>
          <div className="kn-top-links">
            <a href={`mailto:${resumeData.personal.email}`}>문의</a>
            <span>|</span>
            <a href="#">구독</a>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header className="kn-header">
        <div className="kn-header-content">
          <h1 className="kn-logo">포트폴리오 데일리</h1>
          <p className="kn-tagline">기술과 혁신의 최전선</p>
        </div>
      </header>

      {/* Navigation */}
      <nav className="kn-nav">
        <div className="kn-nav-content">
          {categories.map(cat => (
            <button
              key={cat.id}
              className={`kn-nav-item ${activeCategory === cat.id ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat.id)}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </nav>

      {/* Breaking News Ticker */}
      <div className="kn-ticker">
        <span className="kn-ticker-label">속보</span>
        <div className="kn-ticker-content">
          <span>{getText(resumeData.personal.name)}, {getText(resumeData.personal.title)}로서 기술 혁신 주도 중</span>
        </div>
      </div>

      {/* Main Content */}
      <main className="kn-main">
        <div className="kn-container">
          {/* Hero Section */}
          <section className="kn-hero">
            <article className="kn-hero-article">
              <span className="kn-badge">단독</span>
              <h2 className="kn-hero-title">
                "{getText(resumeData.personal.name)}" 개발자, AI 시대 새로운 기술 패러다임 제시
              </h2>
              <p className="kn-hero-summary">
                {getText(resumeData.personal.location)} 기반의 {getText(resumeData.personal.title)}가
                최신 기술 트렌드를 이끌며 혁신적인 프로젝트를 진행 중이다.
                다양한 기술 스택을 활용한 솔루션 개발에 주력하고 있다.
              </p>
              <div className="kn-hero-meta">
                <span className="kn-reporter">기술부 기자</span>
                <span className="kn-time">오늘</span>
              </div>
            </article>

            {/* Side Headlines */}
            <aside className="kn-side-headlines">
              <h3 className="kn-section-title">오늘의 주요 기사</h3>
              <ul className="kn-headline-list">
                <li>
                  <a href="#education">
                    <span className="kn-category-tag">학력</span>
                    {getText(getFeaturedItems(resumeData.education)[0]?.institution)}에서 {getText(getFeaturedItems(resumeData.education)[0]?.degree)} 취득
                  </a>
                </li>
                <li>
                  <a href="#experience">
                    <span className="kn-category-tag">경력</span>
                    {getText(getFeaturedItems(resumeData.experience)[0]?.company)}에서 {getText(getFeaturedItems(resumeData.experience)[0]?.position)} 역임
                  </a>
                </li>
                <li>
                  <a href="#skills">
                    <span className="kn-category-tag">기술</span>
                    {programmingSkills.slice(0, 3).join(', ')} 등 다양한 기술 보유
                  </a>
                </li>
              </ul>
            </aside>
          </section>

          {/* Content Grid */}
          <div className="kn-grid">
            {/* Education Section */}
            <section className="kn-section" id="education">
              <h3 className="kn-section-header">
                <span className="kn-section-icon">🎓</span>
                학력
              </h3>
              <div className="kn-article-list">
                {getFeaturedItems(resumeData.education).map((edu, i) => (
                  <article key={i} className="kn-article-card">
                    <h4>{getText(edu.institution)}</h4>
                    <p>{getText(edu.degree)}</p>
                    <span className="kn-period">{edu.period}</span>
                  </article>
                ))}
              </div>
            </section>

            {/* Experience Section */}
            <section className="kn-section" id="experience">
              <h3 className="kn-section-header">
                <span className="kn-section-icon">💼</span>
                경력
              </h3>
              <div className="kn-article-list">
                {getFeaturedItems(resumeData.experience).map((exp, i) => (
                  <article key={i} className="kn-article-card">
                    <h4>{getText(exp.company)}</h4>
                    <p className="kn-position">{getText(exp.position)}</p>
                    <span className="kn-period">{exp.period}</span>
                    {exp.description && (
                      <p className="kn-description">{getText(exp.description)}</p>
                    )}
                  </article>
                ))}
              </div>
            </section>

            {/* Skills Section */}
            <section className="kn-section kn-section-wide" id="skills">
              <h3 className="kn-section-header">
                <span className="kn-section-icon">🛠️</span>
                보유 기술
              </h3>
              <div className="kn-skills-grid">
                <div className="kn-skill-group">
                  <h5>프로그래밍</h5>
                  <div className="kn-skill-tags">
                    {programmingSkills.map((skill, i) => (
                      <span key={i} className="kn-skill-tag">{skill}</span>
                    ))}
                  </div>
                </div>
                <div className="kn-skill-group">
                  <h5>기술 스택</h5>
                  <div className="kn-skill-tags">
                    {techSkills.map((skill, i) => (
                      <span key={i} className="kn-skill-tag">{skill}</span>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Contact Footer */}
          <footer className="kn-footer">
            <div className="kn-footer-content">
              <div className="kn-footer-info">
                <h4>포트폴리오 데일리</h4>
                <p>연락처: {resumeData.personal.email}</p>
                <p>위치: {getText(resumeData.personal.location)}</p>
              </div>
              <div className="kn-footer-copy">
                <p>© 2024 포트폴리오 데일리. All rights reserved.</p>
              </div>
            </div>
          </footer>
        </div>
      </main>

      <StyleSwitcher />
      <style>{`
        .kn-view {
          height: 100vh;
          overflow-y: auto;
          overflow-x: hidden;
          background: #f5f5f5;
          font-family: 'Noto Sans KR', 'Malgun Gothic', sans-serif;
          color: #333;
        }

        /* Top Bar */
        .kn-top-bar {
          background: #1a1a2e;
          color: #fff;
          font-size: 0.8rem;
          padding: 0.5rem 0;
        }
        .kn-top-content {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 1rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .kn-date {
          color: rgba(255,255,255,0.7);
        }
        .kn-top-links a {
          color: rgba(255,255,255,0.9);
          text-decoration: none;
          margin: 0 0.5rem;
        }
        .kn-top-links a:hover {
          text-decoration: underline;
        }
        .kn-top-links span {
          color: rgba(255,255,255,0.3);
        }

        /* Header */
        .kn-header {
          background: #fff;
          border-bottom: 1px solid #e0e0e0;
          padding: 1.5rem 0;
        }
        .kn-header-content {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 1rem;
          text-align: center;
        }
        .kn-logo {
          font-size: 2.5rem;
          font-weight: 900;
          color: #1a1a2e;
          margin: 0;
          letter-spacing: -0.02em;
        }
        .kn-tagline {
          color: #666;
          font-size: 0.9rem;
          margin: 0.25rem 0 0;
        }

        /* Navigation */
        .kn-nav {
          background: #fff;
          border-bottom: 2px solid #1a1a2e;
          position: sticky;
          top: 0;
          z-index: 100;
        }
        .kn-nav-content {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 1rem;
          display: flex;
          gap: 0;
        }
        .kn-nav-item {
          background: none;
          border: none;
          padding: 1rem 1.5rem;
          font-size: 0.95rem;
          color: #333;
          cursor: pointer;
          border-bottom: 3px solid transparent;
          transition: all 0.2s;
          font-family: inherit;
        }
        .kn-nav-item:hover {
          background: #f5f5f5;
          color: #0066cc;
        }
        .kn-nav-item.active {
          color: #0066cc;
          border-bottom-color: #0066cc;
          font-weight: 600;
        }

        /* Ticker */
        .kn-ticker {
          background: #fff;
          border-bottom: 1px solid #e0e0e0;
          display: flex;
          align-items: center;
          padding: 0.75rem 1rem;
          max-width: 1200px;
          margin: 0 auto;
        }
        .kn-ticker-label {
          background: #c00000;
          color: #fff;
          padding: 0.25rem 0.75rem;
          font-size: 0.8rem;
          font-weight: 700;
          margin-right: 1rem;
        }
        .kn-ticker-content {
          color: #333;
          font-size: 0.9rem;
        }

        /* Main */
        .kn-main {
          padding: 2rem 0;
        }
        .kn-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 1rem;
        }

        /* Hero */
        .kn-hero {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 2rem;
          margin-bottom: 2rem;
        }
        .kn-hero-article {
          background: #fff;
          padding: 2rem;
          border-radius: 4px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.08);
        }
        .kn-badge {
          display: inline-block;
          background: #0066cc;
          color: #fff;
          padding: 0.25rem 0.75rem;
          font-size: 0.75rem;
          font-weight: 700;
          margin-bottom: 1rem;
        }
        .kn-hero-title {
          font-size: 1.75rem;
          font-weight: 700;
          line-height: 1.4;
          margin: 0 0 1rem;
          color: #1a1a2e;
        }
        .kn-hero-summary {
          color: #555;
          line-height: 1.8;
          margin: 0 0 1rem;
        }
        .kn-hero-meta {
          display: flex;
          gap: 1rem;
          color: #888;
          font-size: 0.85rem;
        }

        /* Side Headlines */
        .kn-side-headlines {
          background: #fff;
          padding: 1.5rem;
          border-radius: 4px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.08);
        }
        .kn-section-title {
          font-size: 1rem;
          font-weight: 700;
          color: #1a1a2e;
          margin: 0 0 1rem;
          padding-bottom: 0.75rem;
          border-bottom: 2px solid #1a1a2e;
        }
        .kn-headline-list {
          list-style: none;
          margin: 0;
          padding: 0;
        }
        .kn-headline-list li {
          padding: 0.75rem 0;
          border-bottom: 1px solid #eee;
        }
        .kn-headline-list li:last-child {
          border-bottom: none;
        }
        .kn-headline-list a {
          color: #333;
          text-decoration: none;
          font-size: 0.9rem;
          line-height: 1.5;
          display: block;
        }
        .kn-headline-list a:hover {
          color: #0066cc;
        }
        .kn-category-tag {
          display: inline-block;
          background: #f0f0f0;
          color: #666;
          padding: 0.15rem 0.5rem;
          font-size: 0.7rem;
          margin-right: 0.5rem;
          border-radius: 2px;
        }

        /* Grid */
        .kn-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 2rem;
        }
        .kn-section {
          background: #fff;
          padding: 1.5rem;
          border-radius: 4px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.08);
        }
        .kn-section-wide {
          grid-column: span 2;
        }
        .kn-section-header {
          font-size: 1.1rem;
          font-weight: 700;
          color: #1a1a2e;
          margin: 0 0 1rem;
          padding-bottom: 0.75rem;
          border-bottom: 2px solid #1a1a2e;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .kn-section-icon {
          font-size: 1.2rem;
        }

        /* Article Cards */
        .kn-article-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .kn-article-card {
          padding: 1rem;
          background: #fafafa;
          border-radius: 4px;
          border-left: 3px solid #0066cc;
        }
        .kn-article-card h4 {
          margin: 0 0 0.5rem;
          font-size: 1rem;
          color: #1a1a2e;
        }
        .kn-article-card p {
          margin: 0;
          color: #555;
          font-size: 0.9rem;
        }
        .kn-position {
          color: #0066cc !important;
          font-weight: 500;
        }
        .kn-period {
          display: block;
          color: #888;
          font-size: 0.8rem;
          margin-top: 0.5rem;
        }
        .kn-description {
          margin-top: 0.75rem !important;
          line-height: 1.6;
        }

        /* Skills */
        .kn-skills-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1.5rem;
        }
        .kn-skill-group h5 {
          font-size: 0.9rem;
          color: #666;
          margin: 0 0 0.75rem;
          font-weight: 600;
        }
        .kn-skill-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }
        .kn-skill-tag {
          background: #e8f0fe;
          color: #0066cc;
          padding: 0.4rem 0.8rem;
          font-size: 0.85rem;
          border-radius: 3px;
        }

        /* Footer */
        .kn-footer {
          margin-top: 3rem;
          background: #1a1a2e;
          color: #fff;
          padding: 2rem;
          border-radius: 4px;
        }
        .kn-footer-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .kn-footer-info h4 {
          margin: 0 0 0.5rem;
          font-size: 1.2rem;
        }
        .kn-footer-info p {
          margin: 0.25rem 0;
          color: rgba(255,255,255,0.7);
          font-size: 0.85rem;
        }
        .kn-footer-copy p {
          margin: 0;
          color: rgba(255,255,255,0.5);
          font-size: 0.8rem;
        }

        /* Responsive */
        @media (max-width: 900px) {
          .kn-hero {
            grid-template-columns: 1fr;
          }
          .kn-grid {
            grid-template-columns: 1fr;
          }
          .kn-section-wide {
            grid-column: span 1;
          }
          .kn-skills-grid {
            grid-template-columns: 1fr;
          }
          .kn-footer-content {
            flex-direction: column;
            text-align: center;
            gap: 1rem;
          }
        }
        @media (max-width: 600px) {
          .kn-logo {
            font-size: 1.8rem;
          }
          .kn-nav-content {
            overflow-x: auto;
            -webkit-overflow-scrolling: touch;
          }
          .kn-nav-item {
            padding: 0.75rem 1rem;
            white-space: nowrap;
          }
          .kn-hero-title {
            font-size: 1.3rem;
          }
        }
      `}</style>
    </div>
  )
}
