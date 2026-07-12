import { useEffect, useRef, useState } from 'react'
import StyleSwitcher from '../StyleSwitcher'
import { getSectionItems, profile, SECTION_META } from '../../lib/profileData'
import './EditorialView.css'

function EditorialRecord({ item }) {
  return (
    <article className="edit-record">
      <time>{item.period || 'Undated'}</time>
      <div>
        <h3>{item.link ? <a href={item.link} target="_blank" rel="noopener noreferrer">{item.title}<sup>↗</sup></a> : item.title}</h3>
        {item.subtitle && <h4>{item.subtitle}</h4>}
        {item.description && <p>{item.description}</p>}
      </div>
    </article>
  )
}

function EditorialSection({ section, showAll }) {
  const items = getSectionItems(section.id, showAll)
  return (
    <section id={`edit-${section.id}`} className="edit-section">
      <header>
        <h2>{section.label}</h2>
        <span>{items.length}</span>
      </header>
      <div className="edit-records">{items.map((item) => <EditorialRecord key={item.id} item={item} />)}</div>
    </section>
  )
}

export default function EditorialView() {
  const [showAll, setShowAll] = useState(false)
  const [activeSection, setActiveSection] = useState(SECTION_META[0].id)
  const scrollRef = useRef(null)

  useEffect(() => {
    const root = scrollRef.current
    if (!root) return undefined
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
      if (visible) setActiveSection(visible.target.id.replace('edit-', ''))
    }, { root, rootMargin: '-15% 0px -65%', threshold: [0.05, 0.2] })
    root.querySelectorAll('.edit-section').forEach((section) => observer.observe(section))
    return () => observer.disconnect()
  }, [])

  const jumpTo = (id) => scrollRef.current?.querySelector(`#edit-${id}`)?.scrollIntoView({ behavior: 'smooth' })

  return (
    <main className="edit-view">
      <div className="edit-scroll" ref={scrollRef}>
        <header className="edit-nav">
          <button className="edit-wordmark" onClick={() => scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' })}>Taeho Je</button>
          <nav aria-label="Portfolio sections">
            {SECTION_META.map((section) => <button key={section.id} className={activeSection === section.id ? 'active' : ''} onClick={() => jumpTo(section.id)}>{section.shortLabel}</button>)}
          </nav>
          <button className={`edit-archive ${showAll ? 'active' : ''}`} onClick={() => setShowAll((value) => !value)}>{showAll ? 'Archive on' : 'Archive off'}</button>
        </header>

        <section className="edit-hero">
          <div className="edit-hero-name" aria-label={profile.name}>
            <span>TAEHO</span>
            <span>JE</span>
          </div>
          <div className="edit-hero-copy">
            <h1>{profile.title}</h1>
            <p>{profile.about}</p>
            <div>
              <a href={profile.github} target="_blank" rel="noopener noreferrer">GitHub</a>
              <a href={profile.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn</a>
              <a href={`mailto:${profile.email}`}>Email</a>
            </div>
          </div>
        </section>

        <nav className="edit-index" aria-label="Portfolio index">
          {SECTION_META.map((section) => (
            <button key={section.id} onClick={() => jumpTo(section.id)}>
              <span>{section.label}</span>
              <strong>{profile.sectionCounts[section.id][showAll ? 'total' : 'featured']}</strong>
            </button>
          ))}
        </nav>

        <div className="edit-content">
          {SECTION_META.map((section) => <EditorialSection key={section.id} section={section} showAll={showAll} />)}
        </div>

        <footer className="edit-footer"><strong>{profile.name}</strong><a href={`mailto:${profile.email}`}>{profile.email}</a></footer>
      </div>
      <StyleSwitcher />
    </main>
  )
}
