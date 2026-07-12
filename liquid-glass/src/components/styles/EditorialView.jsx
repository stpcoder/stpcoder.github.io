import { useRef, useState } from 'react'
import StyleSwitcher from '../StyleSwitcher'
import { getSectionItems, profile, SECTION_META } from '../../lib/profileData'
import './EditorialView.css'

function EditorialSection({ section, showAll, index }) {
  const items = getSectionItems(section.id, showAll)
  const featureLayout = section.id === 'projects' || section.id === 'media'

  return (
    <section id={`editorial-${section.id}`} className={`editorial-section ${featureLayout ? 'feature-grid' : ''}`}>
      <header className="editorial-section-heading">
        <span>{String(index + 1).padStart(2, '0')}</span>
        <h2>{section.label}</h2>
        <small>{items.length} entries</small>
      </header>

      <div className="editorial-records">
        {items.map((item, itemIndex) => (
          <article key={item.id} className={itemIndex === 0 && featureLayout ? 'lead' : ''}>
            <div className="editorial-record-meta">
              <span>{item.period || section.shortLabel}</span>
              {item.category && <small>{item.category}</small>}
            </div>
            <div className="editorial-record-copy">
              <h3>
                {item.link ? <a href={item.link} target="_blank" rel="noopener noreferrer">{item.title}<sup>↗</sup></a> : item.title}
              </h3>
              {item.subtitle && <h4>{item.subtitle}</h4>}
              {item.description && <p>{item.description}</p>}
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

export default function EditorialView() {
  const [showAll, setShowAll] = useState(false)
  const scrollRef = useRef(null)

  const jumpTo = (section) => {
    scrollRef.current?.querySelector(`#editorial-${section}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <main className="editorial-view">
      <div className="editorial-scroll" ref={scrollRef}>
        <header className="editorial-masthead">
          <div className="editorial-brand">T/J</div>
          <div className="editorial-issue"><span>Portfolio Index</span><small>Vol. 26 · Seoul / Pohang</small></div>
          <nav>
            {SECTION_META.map((section) => <button key={section.id} onClick={() => jumpTo(section.id)}>{section.shortLabel}</button>)}
          </nav>
          <button className={showAll ? 'active' : ''} onClick={() => setShowAll((value) => !value)}>{showAll ? 'Archive: on' : 'Archive: off'}</button>
        </header>

        <section className="editorial-cover">
          <div className="editorial-cover-index">
            <span>Independent portfolio</span>
            <span>Updated 2026</span>
          </div>
          <div className="editorial-cover-title">
            <p>Engineer / Builder / Problem Solver</p>
            <h1>{profile.name}</h1>
            <h2>{profile.title}</h2>
          </div>
          <div className="editorial-cover-note">
            <p>{profile.about}</p>
            <div>
              <a href={profile.github} target="_blank" rel="noopener noreferrer">GitHub ↗</a>
              <a href={profile.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn ↗</a>
              <a href={`mailto:${profile.email}`}>Email ↗</a>
            </div>
          </div>
          <aside className="editorial-cover-stats">
            {SECTION_META.slice(1, 5).map((section) => (
              <div key={section.id}><strong>{profile.sectionCounts[section.id][showAll ? 'total' : 'featured']}</strong><span>{section.label}</span></div>
            ))}
          </aside>
          <div className="editorial-cover-mark" aria-hidden="true">J</div>
        </section>

        <div className="editorial-body">
          {SECTION_META.map((section, index) => <EditorialSection key={section.id} section={section} showAll={showAll} index={index} />)}
        </div>

        <footer className="editorial-footer">
          <span>End of selected records</span>
          <strong>{profile.name}</strong>
          <a href={`mailto:${profile.email}`}>{profile.email}</a>
        </footer>
      </div>
      <StyleSwitcher />
    </main>
  )
}
