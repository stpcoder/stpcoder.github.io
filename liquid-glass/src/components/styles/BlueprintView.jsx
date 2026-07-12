import { useMemo, useState } from 'react'
import StyleSwitcher from '../StyleSwitcher'
import { getSectionItems, profile, SECTION_META } from '../../lib/profileData'
import './BlueprintView.css'

function BlueprintRecord({ item, index }) {
  return (
    <article className="blueprint-record">
      <div className="blueprint-record-index">R-{String(index + 1).padStart(2, '0')}</div>
      <div className="blueprint-record-main">
        <header>
          <span>{item.period || 'UNSPECIFIED'}</span>
          {item.category && <small>{item.category}</small>}
        </header>
        <h3>{item.link ? <a href={item.link} target="_blank" rel="noopener noreferrer">{item.title} ↗</a> : item.title}</h3>
        {item.subtitle && <h4>{item.subtitle}</h4>}
        {item.description && <p>{item.description}</p>}
      </div>
    </article>
  )
}

export default function BlueprintView() {
  const [activeSection, setActiveSection] = useState('projects')
  const [showAll, setShowAll] = useState(false)
  const activeMeta = SECTION_META.find((section) => section.id === activeSection)
  const items = useMemo(() => getSectionItems(activeSection, showAll), [activeSection, showAll])

  return (
    <main className="blueprint-view">
      <div className="blueprint-grid" aria-hidden="true" />
      <header className="blueprint-header">
        <div className="blueprint-wordmark"><span>TJ</span><strong>Portfolio Systems</strong></div>
        <div className="blueprint-header-meta"><span>DOCUMENT / 2026</span><span>REVISION / 07.12</span><span>STATUS / ACTIVE</span></div>
        <button className={showAll ? 'active' : ''} onClick={() => setShowAll((value) => !value)}>{showAll ? 'FULL DATASET' : 'PUBLIC SET'}</button>
      </header>

      <div className="blueprint-layout">
        <aside className="blueprint-sidebar">
          <div className="blueprint-profile-block">
            <span className="blueprint-profile-code">SUBJECT / 001</span>
            <h1>{profile.name}</h1>
            <p>{profile.title}</p>
            <small>{profile.location}</small>
          </div>

          <nav aria-label="Portfolio sections">
            {SECTION_META.map((section) => (
              <button key={section.id} className={activeSection === section.id ? 'active' : ''} onClick={() => setActiveSection(section.id)}>
                <span>{section.symbol}</span>
                <strong>{section.label}</strong>
                <small>{profile.sectionCounts[section.id][showAll ? 'total' : 'featured']}</small>
              </button>
            ))}
          </nav>

          <div className="blueprint-contact-block">
            <span>PUBLIC CHANNELS</span>
            <a href={profile.github} target="_blank" rel="noopener noreferrer">github.com/stpcoder</a>
            <a href={profile.linkedin} target="_blank" rel="noopener noreferrer">linkedin.com/in/taehoje</a>
            <a href={`mailto:${profile.email}`}>{profile.email}</a>
          </div>
        </aside>

        <section className="blueprint-main">
          <header className="blueprint-section-header">
            <div>
              <span>SECTION {activeMeta.symbol}</span>
              <h2>{activeMeta.label}</h2>
            </div>
            <dl>
              <div><dt>Records</dt><dd>{String(items.length).padStart(2, '0')}</dd></div>
              <div><dt>View</dt><dd>{showAll ? 'Archive' : 'Selected'}</dd></div>
              <div><dt>Source</dt><dd>JSON</dd></div>
            </dl>
          </header>

          <div className="blueprint-ruler"><span>0</span><i /><span>25</span><i /><span>50</span><i /><span>75</span><i /><span>100</span></div>

          <div className="blueprint-records">
            {items.map((item, index) => <BlueprintRecord key={item.id} item={item} index={index} />)}
          </div>
        </section>

        <aside className="blueprint-inspector">
          <div className="blueprint-inspector-card">
            <span>PROFILE NOTE</span>
            <p>{profile.about}</p>
          </div>
          <div className="blueprint-skill-matrix">
            <span>CAPABILITY MATRIX</span>
            {profile.skills.map((skill) => (
              <div key={skill.name}><label>{skill.name}</label><i><b style={{ width: `${skill.level}%` }} /></i><small>{skill.level}</small></div>
            ))}
          </div>
          <div className="blueprint-stamp"><span>VERIFIED</span><strong>2026</strong><small>TAEHO JE / PORTFOLIO</small></div>
        </aside>
      </div>
      <StyleSwitcher />
    </main>
  )
}
