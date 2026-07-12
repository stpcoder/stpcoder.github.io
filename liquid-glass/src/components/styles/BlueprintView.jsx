import { useMemo, useRef, useState } from 'react'
import StyleSwitcher from '../StyleSwitcher'
import { getSectionItems, profile, SECTION_META } from '../../lib/profileData'
import './BlueprintView.css'

function BlueprintRecord({ item, index }) {
  return (
    <article className="plan-record">
      <span className="plan-record-number">{String(index + 1).padStart(2, '0')}</span>
      <time>{item.period || 'Undated'}</time>
      <h3>{item.link ? <a href={item.link} target="_blank" rel="noopener noreferrer">{item.title}<span>↗</span></a> : item.title}</h3>
      {item.subtitle && <h4>{item.subtitle}</h4>}
      {item.description && <p>{item.description}</p>}
    </article>
  )
}

export default function BlueprintView() {
  const viewRef = useRef(null)
  const [activeSection, setActiveSection] = useState('projects')
  const [showAll, setShowAll] = useState(false)
  const activeMeta = SECTION_META.find((section) => section.id === activeSection)
  const items = useMemo(() => getSectionItems(activeSection, showAll), [activeSection, showAll])

  const trackPointer = (event) => {
    const bounds = event.currentTarget.getBoundingClientRect()
    viewRef.current?.style.setProperty('--plan-x', `${event.clientX - bounds.left}px`)
    viewRef.current?.style.setProperty('--plan-y', `${event.clientY - bounds.top}px`)
  }

  return (
    <main className="plan-view" ref={viewRef} onPointerMove={trackPointer}>
      <div className="plan-grid" aria-hidden="true" />
      <div className="plan-crosshair" aria-hidden="true" />

      <header className="plan-header">
        <button className="plan-name" onClick={() => setActiveSection('projects')}>{profile.name}</button>
        <nav aria-label="Portfolio sections">
          {SECTION_META.map((section) => (
            <button key={section.id} className={activeSection === section.id ? 'active' : ''} onClick={() => setActiveSection(section.id)}>
              <span>{section.label}</span>
              <small>{profile.sectionCounts[section.id][showAll ? 'total' : 'featured']}</small>
            </button>
          ))}
        </nav>
        <button className={`plan-archive ${showAll ? 'active' : ''}`} onClick={() => setShowAll((value) => !value)}>{showAll ? 'All records' : 'Featured'}</button>
      </header>

      <div className="plan-layout">
        <aside className="plan-profile">
          <div className="plan-monogram">TJ</div>
          <h1>{profile.title}</h1>
          <p>{profile.about}</p>
          <div>
            <a href={profile.github} target="_blank" rel="noopener noreferrer">GitHub</a>
            <a href={profile.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn</a>
            <a href={`mailto:${profile.email}`}>Email</a>
          </div>
        </aside>

        <section className="plan-main" key={activeSection}>
          <header className="plan-title">
            <h2>{activeMeta.label}</h2>
            <span>{items.length}</span>
          </header>
          <div className="plan-records">
            {items.map((item, index) => <BlueprintRecord key={item.id} item={item} index={index} />)}
          </div>
        </section>
      </div>
      <StyleSwitcher />
    </main>
  )
}
