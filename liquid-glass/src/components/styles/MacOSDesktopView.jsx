import { AnimatePresence, motion as Motion } from 'framer-motion'
import { useEffect, useMemo, useRef, useState } from 'react'
import StyleSwitcher from '../StyleSwitcher'
import { getAllItems, getSectionItems, profile, SECTION_META } from '../../lib/profileData'
import './MacOSDesktopView.css'

const APP_META = {
  overview: { label: 'Taeho', glyph: 'TJ', tone: 'profile' },
  education: { label: 'Education', glyph: 'ED', tone: 'blue' },
  experience: { label: 'Experience', glyph: 'EX', tone: 'orange' },
  projects: { label: 'Projects', glyph: '⌘', tone: 'folder' },
  awards: { label: 'Awards', glyph: '★', tone: 'gold' },
  scholarships: { label: 'Scholarships', glyph: 'S', tone: 'violet' },
  media: { label: 'Media', glyph: '▶', tone: 'pink' },
  activities: { label: 'Activities', glyph: 'A', tone: 'green' }
}

const DESKTOP_APPS = ['overview', 'projects', 'media', 'awards']
const DOCK_APPS = ['overview', 'projects', 'experience', 'awards', 'media', 'activities']

function AppIcon({ app, size = 'regular' }) {
  const meta = APP_META[app]
  return <span className={`mac-app-icon ${meta.tone} ${size}`}>{meta.glyph}</span>
}

function useClock() {
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 30000)
    return () => window.clearInterval(timer)
  }, [])

  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  }).format(now)
}

function MenuBar({ onAppleMenu, appleMenuOpen, onSpotlight, onControlCenter }) {
  const time = useClock()

  return (
    <header className="mac-menubar">
      <div className="mac-menubar-left">
        <button className={appleMenuOpen ? 'active' : ''} onClick={onAppleMenu} aria-label="Apple menu">●</button>
        <strong>Portfolio</strong>
        <span>File</span><span>Edit</span><span>View</span><span>Window</span><span>Help</span>
      </div>
      <div className="mac-menubar-right">
        <button onClick={onControlCenter} aria-label="Wi-Fi and battery"><span className="mac-wifi">◒</span><span className="mac-battery">▰</span></button>
        <button onClick={onSpotlight} aria-label="Spotlight search">⌕</button>
        <time>{time}</time>
      </div>
    </header>
  )
}

function AppleMenu({ onClose, onOpenAbout }) {
  return (
    <Motion.div
      className="mac-apple-menu"
      initial={{ opacity: 0, y: -6, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -6, scale: 0.98 }}
    >
      <button onClick={onOpenAbout}>About This Portfolio</button>
      <hr />
      <button onClick={onClose}>System Settings…</button>
      <button onClick={onClose}>App Store…</button>
      <hr />
      <button onClick={onClose}>Recent Items <span>›</span></button>
      <hr />
      <button onClick={onClose}>Lock Screen</button>
    </Motion.div>
  )
}

function DesktopIcon({ app, onOpen }) {
  return (
    <button className="mac-desktop-item" onDoubleClick={() => onOpen(app)} onClick={() => onOpen(app)}>
      <AppIcon app={app} />
      <span>{APP_META[app].label}</span>
    </button>
  )
}

function OverviewContent({ onOpen }) {
  const recentProjects = getSectionItems('projects', false).slice(0, 3)
  const recentAwards = getSectionItems('awards', false).slice(0, 3)

  return (
    <div className="mac-overview">
      <section className="mac-profile-hero">
        <div className="mac-profile-mark">TJ</div>
        <div>
          <span className="mac-overline">Portfolio · 2026</span>
          <h1>{profile.name}</h1>
          <p>{profile.title}</p>
          <small>{profile.location}</small>
        </div>
        <a href={`mailto:${profile.email}`}>Contact</a>
      </section>

      <div className="mac-overview-grid">
        <section className="mac-overview-card mac-about-card">
          <header><span>About</span><button onClick={() => onOpen('experience')}>View work</button></header>
          <p>{profile.about}</p>
          <div className="mac-skill-cloud">
            {profile.skills.slice(0, 7).map((skill) => <span key={skill.name}>{skill.name}</span>)}
          </div>
        </section>

        <section className="mac-overview-card">
          <header><span>Selected work</span><button onClick={() => onOpen('projects')}>Open Finder</button></header>
          <div className="mac-compact-list">
            {recentProjects.map((item) => (
              <button key={item.id} onClick={() => onOpen('projects')}>
                <AppIcon app="projects" size="small" />
                <span><strong>{item.title}</strong><small>{item.period}</small></span>
              </button>
            ))}
          </div>
        </section>

        <section className="mac-overview-card mac-award-summary">
          <header><span>Recent recognition</span><button onClick={() => onOpen('awards')}>See all</button></header>
          {recentAwards.map((item, index) => (
            <div key={item.id}><span>{String(index + 1).padStart(2, '0')}</span><p><strong>{item.title}</strong><small>{item.period} · {item.subtitle}</small></p></div>
          ))}
        </section>
      </div>
    </div>
  )
}

function SectionContent({ section, showAll }) {
  const items = getSectionItems(section, showAll)
  const isGrid = section === 'projects' || section === 'media'

  return (
    <div className={`mac-section-content ${isGrid ? 'grid' : ''}`}>
      <div className="mac-section-intro">
        <span>{APP_META[section].glyph}</span>
        <div><h1>{APP_META[section].label}</h1><p>{items.length} {showAll ? 'archived' : 'selected'} records</p></div>
      </div>

      <div className="mac-records">
        {items.map((item) => (
          <article key={item.id} className="mac-record">
            <div className="mac-record-leading">
              <AppIcon app={section} size="small" />
              <span>{item.period || 'Record'}</span>
            </div>
            <div className="mac-record-copy">
              <h2>{item.link ? <a href={item.link} target="_blank" rel="noopener noreferrer">{item.title}<span>↗</span></a> : item.title}</h2>
              {item.subtitle && <h3>{item.subtitle}</h3>}
              {item.description && <p>{item.description}</p>}
              {item.category && <small>{item.category}</small>}
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}

function PortfolioWindow({
  desktopRef,
  activeSection,
  onSectionChange,
  onClose,
  minimized,
  onMinimize,
  fullscreen,
  onFullscreen,
  showAll,
  onToggleArchive
}) {
  if (minimized) return null

  return (
    <Motion.section
      className={`mac-portfolio-window ${fullscreen ? 'fullscreen' : ''}`}
      drag={!fullscreen}
      dragConstraints={desktopRef}
      dragMomentum={false}
      initial={false}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.94, y: 20 }}
      transition={{ type: 'spring', stiffness: 350, damping: 32 }}
    >
      <header className="mac-window-titlebar">
        <div className="mac-traffic-lights">
          <button className="close" onClick={onClose} aria-label="Close window">×</button>
          <button className="minimize" onClick={onMinimize} aria-label="Minimize window">−</button>
          <button className="expand" onClick={onFullscreen} aria-label="Toggle fullscreen">+</button>
        </div>
        <div className="mac-window-nav"><button>‹</button><button>›</button></div>
        <strong>{APP_META[activeSection].label}</strong>
        <div className="mac-window-tools">
          <button className={showAll ? 'active' : ''} onClick={onToggleArchive}>{showAll ? 'All records' : 'Featured'}</button>
          <button aria-label="Share">⇧</button>
        </div>
      </header>

      <div className="mac-window-layout">
        <aside className="mac-window-sidebar">
          <span className="mac-sidebar-label">Favorites</span>
          <button className={activeSection === 'overview' ? 'active' : ''} onClick={() => onSectionChange('overview')}>
            <AppIcon app="overview" size="tiny" /><span>Portfolio</span>
          </button>
          <span className="mac-sidebar-label">Records</span>
          {SECTION_META.map((section) => (
            <button key={section.id} className={activeSection === section.id ? 'active' : ''} onClick={() => onSectionChange(section.id)}>
              <AppIcon app={section.id} size="tiny" /><span>{section.label}</span><small>{profile.sectionCounts[section.id][showAll ? 'total' : 'featured']}</small>
            </button>
          ))}
          <div className="mac-sidebar-footer"><span>●</span> Synced from portfolio.json</div>
        </aside>

        <div className="mac-window-main">
          {activeSection === 'overview'
            ? <OverviewContent onOpen={onSectionChange} />
            : <SectionContent section={activeSection} showAll={showAll} />}
        </div>
      </div>
    </Motion.section>
  )
}

function Dock({ onOpen, running, minimized }) {
  return (
    <nav className="mac-dock" aria-label="Portfolio applications">
      {DOCK_APPS.map((app) => (
        <button key={app} onClick={() => onOpen(app)} title={APP_META[app].label}>
          <AppIcon app={app} />
          {(running || minimized) && <i />}
          <span>{APP_META[app].label}</span>
        </button>
      ))}
      <em />
      <button className="mac-trash" title="Archive"><span>▱</span><small>Archive</small></button>
    </nav>
  )
}

function Launchpad({ onClose, onOpen }) {
  return (
    <Motion.div className="mac-launchpad" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
      <div className="mac-launchpad-search">⌕ <span>Search apps</span></div>
      <div className="mac-launchpad-grid" onClick={(event) => event.stopPropagation()}>
        {Object.keys(APP_META).map((app) => (
          <button key={app} onClick={() => { onOpen(app); onClose() }}><AppIcon app={app} /><span>{APP_META[app].label}</span></button>
        ))}
      </div>
    </Motion.div>
  )
}

function Spotlight({ query, setQuery, onClose, onOpen }) {
  const results = useMemo(() => {
    if (!query.trim()) return []
    const normalized = query.toLowerCase()
    return getAllItems(true).filter((item) => `${item.title} ${item.subtitle} ${item.description}`.toLowerCase().includes(normalized)).slice(0, 7)
  }, [query])

  return (
    <Motion.div className="mac-dialog-layer" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
      <Motion.div className="mac-spotlight" initial={{ y: -20, scale: 0.96 }} animate={{ y: 0, scale: 1 }} onClick={(event) => event.stopPropagation()}>
        <div className="mac-spotlight-input"><span>⌕</span><input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Spotlight Search" /></div>
        {results.length > 0 && <div className="mac-spotlight-results">{results.map((item) => <button key={item.id} onClick={() => { onOpen(item.section); onClose() }}><AppIcon app={item.section} size="tiny" /><span><strong>{item.title}</strong><small>{APP_META[item.section].label} · {item.period}</small></span></button>)}</div>}
      </Motion.div>
    </Motion.div>
  )
}

function ControlCenter({ onClose }) {
  return (
    <Motion.div className="mac-control-center" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
      <div className="mac-control-grid">
        <button className="active"><span>◒</span><strong>Wi-Fi</strong><small>Portfolio Network</small></button>
        <button className="active"><span>⌁</span><strong>Bluetooth</strong><small>On</small></button>
        <button><span>◐</span><strong>Focus</strong><small>Off</small></button>
      </div>
      <label>Display <input type="range" defaultValue="72" /></label>
      <label>Sound <input type="range" defaultValue="38" /></label>
      <button className="mac-control-close" onClick={onClose}>Done</button>
    </Motion.div>
  )
}

export default function MacOSDesktopView() {
  const desktopRef = useRef(null)
  const [activeSection, setActiveSection] = useState('overview')
  const [windowOpen, setWindowOpen] = useState(true)
  const [minimized, setMinimized] = useState(false)
  const [fullscreen, setFullscreen] = useState(false)
  const [showAll, setShowAll] = useState(false)
  const [launchpadOpen, setLaunchpadOpen] = useState(false)
  const [spotlightOpen, setSpotlightOpen] = useState(false)
  const [controlCenterOpen, setControlCenterOpen] = useState(false)
  const [appleMenuOpen, setAppleMenuOpen] = useState(false)
  const [query, setQuery] = useState('')

  const openApp = (app) => {
    setActiveSection(app)
    setWindowOpen(true)
    setMinimized(false)
  }

  return (
    <main className="mac-desktop" ref={desktopRef} onPointerDown={() => setAppleMenuOpen(false)}>
      <div className="mac-wallpaper" aria-hidden="true"><i /><i /><i /></div>
      <MenuBar
        appleMenuOpen={appleMenuOpen}
        onAppleMenu={(event) => { event.stopPropagation(); setAppleMenuOpen((value) => !value) }}
        onSpotlight={() => setSpotlightOpen(true)}
        onControlCenter={() => setControlCenterOpen((value) => !value)}
      />

      <AnimatePresence>
        {appleMenuOpen && <AppleMenu onClose={() => setAppleMenuOpen(false)} onOpenAbout={() => { openApp('overview'); setAppleMenuOpen(false) }} />}
        {controlCenterOpen && <ControlCenter onClose={() => setControlCenterOpen(false)} />}
      </AnimatePresence>

      <div className="mac-desktop-icons">
        {DESKTOP_APPS.map((app) => <DesktopIcon key={app} app={app} onOpen={openApp} />)}
      </div>

      <AnimatePresence>
        {windowOpen && (
          <PortfolioWindow
            desktopRef={desktopRef}
            activeSection={activeSection}
            onSectionChange={setActiveSection}
            onClose={() => setWindowOpen(false)}
            minimized={minimized}
            onMinimize={() => setMinimized(true)}
            fullscreen={fullscreen}
            onFullscreen={() => setFullscreen((value) => !value)}
            showAll={showAll}
            onToggleArchive={() => setShowAll((value) => !value)}
          />
        )}
        {launchpadOpen && <Launchpad onClose={() => setLaunchpadOpen(false)} onOpen={openApp} />}
        {spotlightOpen && <Spotlight query={query} setQuery={setQuery} onClose={() => { setSpotlightOpen(false); setQuery('') }} onOpen={openApp} />}
      </AnimatePresence>

      <button className="mac-launchpad-trigger" onClick={() => setLaunchpadOpen(true)} aria-label="Open Launchpad">•••</button>
      <Dock onOpen={openApp} running={windowOpen} minimized={minimized} />
      <StyleSwitcher />
    </main>
  )
}
