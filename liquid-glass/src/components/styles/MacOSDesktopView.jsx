import { AnimatePresence, motion as Motion } from 'framer-motion'
import { useEffect, useMemo, useRef, useState } from 'react'
import StyleSwitcher from '../StyleSwitcher'
import { STYLES, useStyle } from '../../contexts/StyleContext'
import { getAllItems, getSectionItems, profile, SECTION_META } from '../../lib/profileData'
import './MacOSDesktopView.css'

const WALLPAPER_KEY = 'portfolio-macos-wallpaper-v1'
const WALLPAPER_SCALE_KEY = 'portfolio-macos-wallpaper-scale-v1'
const WALLPAPER_VIVID_KEY = 'portfolio-macos-wallpaper-vivid-v1'
const WALLPAPERS = [
  { id: 'sequoia', label: 'Sequoia' },
  { id: 'aurora', label: 'Aurora' },
  { id: 'coast', label: 'Pacific' },
  { id: 'midnight', label: 'Midnight' }
]

function sectionLabel(section) {
  return SECTION_META.find((entry) => entry.id === section)?.label || 'Portfolio'
}

function readPreference(key, fallback) {
  try {
    return localStorage.getItem(key) || fallback
  } catch {
    return fallback
  }
}

function savePreference(key, value) {
  try {
    localStorage.setItem(key, String(value))
  } catch {
    // Preferences remain optional when browser storage is blocked.
  }
}

function AppleMark() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M16.7 12.9c0-2.7 2.2-4 2.3-4.1-1.3-1.9-3.3-2.1-4-2.1-1.7-.2-3.3 1-4.1 1-.8 0-2.1-1-3.5-1-1.8 0-3.5 1.1-4.5 2.7-1.9 3.3-.5 8.2 1.4 10.9.9 1.3 2 2.8 3.5 2.7 1.4-.1 1.9-.9 3.7-.9 1.7 0 2.2.9 3.7.9 1.5 0 2.5-1.3 3.4-2.7 1.1-1.5 1.5-3 1.5-3.1-.1 0-3.4-1.3-3.4-4.3ZM14 4.9c.8-1 1.4-2.4 1.2-3.7-1.2.1-2.7.8-3.6 1.8-.8.9-1.5 2.3-1.3 3.6 1.4.1 2.8-.7 3.7-1.7Z" />
    </svg>
  )
}

function FinderIcon({ size = 52 }) {
  return (
    <svg className="macos-finder-icon" width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
      <path d="M7 5h25v54H13a8 8 0 0 1-8-8V13a8 8 0 0 1 2-8Z" fill="#1b8de4" />
      <path d="M32 5h19a8 8 0 0 1 8 8v38a8 8 0 0 1-8 8H32Z" fill="#a9dcff" />
      <path d="M32 5c-3.8 8.3-6 17.6-6 27.5 0 3.8.3 7.6 1 11.2" fill="none" stroke="#075ca9" strokeWidth="2" />
      <path d="M18 25v3M43 25v3" stroke="#123c64" strokeWidth="2.8" strokeLinecap="round" />
      <path d="M17 42c7.3 6.2 21.9 6.2 30 0" fill="none" stroke="#123c64" strokeWidth="2.6" strokeLinecap="round" />
      <rect x="5" y="5" width="54" height="54" rx="12" fill="none" stroke="rgba(0,0,0,.16)" />
    </svg>
  )
}

function FolderIcon({ size = 62 }) {
  return (
    <svg className="macos-folder-icon" width={size} height={size} viewBox="0 0 72 58" aria-hidden="true">
      <path d="M3 15V9a6 6 0 0 1 6-6h18l7 9h29a6 6 0 0 1 6 6v6Z" fill="#72c9fb" />
      <path d="M3 18h66v31a6 6 0 0 1-6 6H9a6 6 0 0 1-6-6Z" fill="#3eaff2" />
      <path d="M5 19h62v8H5Z" fill="rgba(255,255,255,.22)" />
    </svg>
  )
}

function DocumentIcon({ size = 38 }) {
  return (
    <svg className="macos-document-icon" width={size} height={size} viewBox="0 0 42 50" aria-hidden="true">
      <path d="M5 1h21l11 11v33a4 4 0 0 1-4 4H5a4 4 0 0 1-4-4V5a4 4 0 0 1 4-4Z" fill="#fff" stroke="#c8c8cc" />
      <path d="M26 1v11h11" fill="#e8f4ff" stroke="#c8c8cc" />
      <path d="M9 23h20M9 29h20M9 35h14" stroke="#82b9df" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function DockIcon({ type }) {
  if (type === 'finder') return <FinderIcon />
  if (type === 'folder') return <span className="macos-dock-folder"><FolderIcon size={54} /></span>
  if (type === 'terminal') return <span className="macos-dock-app terminal"><b>&gt;_</b></span>
  if (type === 'mail') return <span className="macos-dock-app mail"><i /><b>@</b></span>
  if (type === 'safari') return <span className="macos-dock-app safari"><i /><b>NE</b></span>
  if (type === 'settings') return <span className="macos-dock-app settings"><i /><b /></span>
  return <span className="macos-trash-icon"><i /><i /><i /></span>
}

function SidebarIcon({ type }) {
  const paths = {
    home: 'M3 10.5 10 4l7 6.5V18H5v-7.5M8 18v-5h4v5',
    education: 'm2 7 8-4 8 4-8 4-8-4Zm3 3v4c3 2 7 2 10 0v-4',
    experience: 'M3 6h14v11H3V6Zm4 0V3h6v3M3 10h14',
    projects: 'M2 6h7l2 2h7v9H2V6Z',
    awards: 'M6 3h8v6a4 4 0 0 1-8 0V3Zm4 10v4M7 17h6M6 5H2v2c0 2 2 3 4 3M14 5h4v2c0 2-2 3-4 3',
    scholarships: 'm3 7 7-4 7 4-7 4-7-4Zm2 3v5h10v-5M8 11v4m4-4v4',
    media: 'M3 4h14v12H3V4Zm5 3 5 3-5 3V7Z',
    activities: 'M10 10a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm-6 7c0-3 2-5 6-5s6 2 6 5'
  }
  return <svg viewBox="0 0 20 20" aria-hidden="true"><path d={paths[type] || paths.projects} /></svg>
}

function useClock() {
  const [now, setNow] = useState(new Date())
  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 30000)
    return () => window.clearInterval(timer)
  }, [])
  return new Intl.DateTimeFormat('en-US', { weekday: 'short', hour: 'numeric', minute: '2-digit' }).format(now)
}

const MENU_DEFINITIONS = {
  apple: [
    { label: 'About This Portfolio', action: 'about' },
    { separator: true },
    { label: 'System Settings...', action: 'settings' },
    { separator: true },
    { label: 'Lock Screen', disabled: true }
  ],
  Finder: [
    { label: 'About Finder', action: 'about' },
    { separator: true },
    { label: 'Hide Finder', disabled: true, shortcut: '⌘H' }
  ],
  File: [
    { label: 'Open Portfolio', action: 'open' },
    { label: 'Close Window', action: 'close', shortcut: '⌘W' }
  ],
  Edit: [
    { label: 'Select All', disabled: true, shortcut: '⌘A' },
    { label: 'Find', action: 'focusSearch', shortcut: '⌘F' }
  ],
  View: [
    { label: 'as Icons', action: 'icons', shortcut: '⌘1' },
    { label: 'as List', action: 'list', shortcut: '⌘2' },
    { separator: true },
    { label: 'Show Archive', action: 'archive' }
  ],
  Go: SECTION_META.map((section) => ({ label: section.label, action: section.id })),
  Window: [
    { label: 'Minimize', action: 'minimize', shortcut: '⌘M' },
    { label: 'Zoom', action: 'zoom' }
  ],
  Help: [{ label: 'Portfolio Help', action: 'about' }]
}

function MenuBar({ activeMenu, setActiveMenu, onAction, appName }) {
  const time = useClock()
  const menuNames = [appName, 'File', 'Edit', 'View', 'Go', 'Window', 'Help']

  return (
    <header className="macos-menu-bar" onPointerDown={(event) => event.stopPropagation()}>
      <div className="macos-menu-left">
        <div className="macos-menu-wrap">
          <button className={activeMenu === 'apple' ? 'active' : ''} onClick={() => setActiveMenu(activeMenu === 'apple' ? null : 'apple')} aria-label="Apple menu"><AppleMark /></button>
          {activeMenu === 'apple' && <MenuDropdown items={MENU_DEFINITIONS.apple} onAction={onAction} />}
        </div>
        {menuNames.map((name, index) => (
          <div className="macos-menu-wrap" key={name}>
            <button className={`${index === 0 ? 'app-name' : ''} ${activeMenu === name ? 'active' : ''}`} onClick={() => setActiveMenu(activeMenu === name ? null : name)}>{name}</button>
            {activeMenu === name && <MenuDropdown items={index === 0 ? [{ label: `About ${appName}`, action: 'about' }, { separator: true }, { label: `Hide ${appName}`, disabled: true, shortcut: '⌘H' }] : MENU_DEFINITIONS[name]} onAction={onAction} />}
          </div>
        ))}
      </div>
      <div className="macos-menu-right">
        <span className="macos-wifi" aria-label="Wi-Fi"><i /><i /><i /></span>
        <span className="macos-battery" aria-label="Battery"><i /></span>
        <span className="macos-control" aria-hidden="true"><i /><i /></span>
        <time>{time}</time>
      </div>
    </header>
  )
}

function MenuDropdown({ items, onAction }) {
  return (
    <Motion.div className="macos-dropdown" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.1 }}>
      {items.map((item, index) => item.separator ? <hr key={`separator-${index}`} /> : (
        <button key={item.label} disabled={item.disabled} onClick={() => onAction(item.action)}>
          <span>{item.label}</span>{item.shortcut && <kbd>{item.shortcut}</kbd>}
        </button>
      ))}
    </Motion.div>
  )
}

function FinderHome({ showAll, onOpen }) {
  return (
    <div className="macos-folder-view">
      {SECTION_META.map((section, index) => (
        <button
          type="button"
          key={section.id}
          className="macos-folder-item"
          onClick={() => onOpen(section.id)}
          style={{ '--folder-delay': `${index * 35}ms` }}
        >
          <FolderIcon />
          <strong>{section.label}</strong>
          <small>{profile.sectionCounts[section.id][showAll ? 'total' : 'featured']} items</small>
        </button>
      ))}
    </div>
  )
}

function FinderRecords({ items, viewMode, selectedId, onSelect, onOpen }) {
  if (viewMode === 'icons') {
    return (
      <div className="macos-record-icon-view">
        {items.map((item) => (
          <button type="button" key={item.id} className={selectedId === item.id ? 'selected' : ''} onClick={() => onSelect(item.id)} onDoubleClick={() => onOpen(item)}>
            <DocumentIcon size={50} />
            <strong>{item.title}</strong>
            <small>{item.period || 'Undated'}</small>
          </button>
        ))}
      </div>
    )
  }

  return (
    <div className="macos-list-view">
      <header><span>Name</span><span>Organization</span><span>Date</span></header>
      {items.map((item) => (
        <button type="button" key={item.id} className={selectedId === item.id ? 'selected' : ''} onClick={() => onSelect(item.id)} onDoubleClick={() => onOpen(item)}>
          <span className="macos-list-name"><DocumentIcon size={28} /><strong>{item.title}</strong></span>
          <span>{item.subtitle || item.category || '-'}</span>
          <span>{item.period || '-'}</span>
        </button>
      ))}
    </div>
  )
}

function QuickLook({ item, onClose }) {
  if (!item) return null
  return (
    <Motion.div className="macos-quicklook-layer" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onPointerDown={onClose}>
      <Motion.article className="macos-quicklook" initial={{ y: 20, scale: 0.97 }} animate={{ y: 0, scale: 1 }} exit={{ y: 20, scale: 0.97 }} onPointerDown={(event) => event.stopPropagation()}>
        <header><button onClick={onClose} aria-label="Close Quick Look" /><strong>{item.title}</strong><span /></header>
        <div className="macos-quicklook-body">
          <DocumentIcon size={64} />
          <div className="macos-quicklook-copy">
            <span>{item.period || 'Portfolio record'}</span>
            <h2>{item.title}</h2>
            {item.subtitle && <h3>{item.subtitle}</h3>}
            {item.description && <p>{item.description}</p>}
            {item.link && <a href={item.link} target="_blank" rel="noopener noreferrer">Open link</a>}
          </div>
        </div>
      </Motion.article>
    </Motion.div>
  )
}

function AboutDialog({ onClose }) {
  return (
    <Motion.div className="macos-about-layer" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onPointerDown={onClose}>
      <Motion.article className="macos-about-dialog" initial={{ scale: 0.95, y: 12 }} animate={{ scale: 1, y: 0 }} onPointerDown={(event) => event.stopPropagation()}>
        <FinderIcon size={76} />
        <h2>{profile.name}</h2>
        <p>{profile.title}</p>
        <small>{profile.location}</small>
        <div><a href={`mailto:${profile.email}`}>Contact</a><button onClick={onClose}>OK</button></div>
      </Motion.article>
    </Motion.div>
  )
}

function FinderWindow({
  desktopRef,
  isMobile,
  section,
  setSection,
  viewMode,
  setViewMode,
  showAll,
  setShowAll,
  search,
  setSearch,
  selectedId,
  setSelectedId,
  onQuickLook,
  onClose,
  onMinimize,
  fullscreen,
  onZoom,
  searchInputRef
}) {
  const items = useMemo(() => {
    const sectionItems = section ? getSectionItems(section, showAll) : []
    if (!search.trim()) return sectionItems
    const query = search.toLowerCase()
    const source = section ? sectionItems : getAllItems(showAll)
    return source.filter((item) => `${item.title} ${item.subtitle} ${item.description}`.toLowerCase().includes(query))
  }, [search, section, showAll])
  const activeMeta = SECTION_META.find((entry) => entry.id === section)

  return (
    <Motion.section
      className={`macos-finder-window ${fullscreen ? 'fullscreen' : ''}`}
      drag={!fullscreen && !isMobile}
      dragConstraints={desktopRef}
      dragMomentum={false}
      initial={{ opacity: 0, scale: 0.96, y: 18 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: 90 }}
      transition={{ type: 'spring', stiffness: 420, damping: 34 }}
    >
      <header className="macos-finder-toolbar">
        <div className="macos-traffic-lights">
          <button className="close" onClick={onClose} aria-label="Close Finder" />
          <button className="minimize" onClick={onMinimize} aria-label="Minimize Finder" />
          <button className="zoom" onClick={onZoom} aria-label="Zoom Finder" />
        </div>
        <div className="macos-nav-buttons">
          <button onClick={() => { setSection(''); setSelectedId(null) }} disabled={!section && !search} aria-label="Back">‹</button>
          <button disabled aria-label="Forward">›</button>
        </div>
        <h1>{search ? 'Search' : activeMeta?.label || 'Portfolio'}</h1>
        <div className="macos-view-control">
          <button className={viewMode === 'icons' ? 'active' : ''} onClick={() => setViewMode('icons')} aria-label="Icon view"><i className="grid-icon" /></button>
          <button className={viewMode === 'list' ? 'active' : ''} onClick={() => setViewMode('list')} aria-label="List view"><i className="list-icon" /></button>
        </div>
        <label className="macos-search-field"><span /><input ref={searchInputRef} value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search" /></label>
      </header>

      <div className="macos-finder-layout">
        <aside className="macos-finder-sidebar">
          <span>Favorites</span>
          <button className={!section ? 'active' : ''} onClick={() => { setSection(''); setSearch('') }}><SidebarIcon type="home" />Portfolio</button>
          {SECTION_META.map((entry) => (
            <button key={entry.id} className={section === entry.id ? 'active' : ''} onClick={() => { setSection(entry.id); setSearch(''); setSelectedId(null) }}>
              <SidebarIcon type={entry.id} />{entry.label}
            </button>
          ))}
          <span>Display</span>
          <button className={showAll ? 'active' : ''} onClick={() => setShowAll((value) => !value)}><i className="macos-archive-dot" />{showAll ? 'All Records' : 'Featured'}</button>
        </aside>

        <div className="macos-finder-content">
          <div className="macos-content-heading">
            <div>
              <h2>{search ? `Results for "${search}"` : activeMeta?.label || profile.name}</h2>
              <p>{search ? `${items.length} matches` : activeMeta ? `${items.length} items` : profile.title}</p>
            </div>
          </div>

          {!section && !search
            ? <FinderHome showAll={showAll} onOpen={(id) => { setSection(id); setSelectedId(null) }} />
            : <FinderRecords items={items} viewMode={viewMode} selectedId={selectedId} onSelect={setSelectedId} onOpen={onQuickLook} />}
        </div>
      </div>

      <footer className="macos-status-bar">
        <span>{section ? `${items.length} items` : `${SECTION_META.length} folders`}</span>
        <span>Press Space for Quick Look</span>
      </footer>
    </Motion.section>
  )
}

function AppWindow({ app, title, desktopRef, isMobile, onClose, children }) {
  const [zoomed, setZoomed] = useState(false)

  return (
    <Motion.section
      className={`macos-app-window ${app} ${zoomed ? 'zoomed' : ''}`}
      drag={!zoomed && !isMobile}
      dragConstraints={desktopRef}
      dragMomentum={false}
      initial={{ opacity: 0, scale: .96, y: 22 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: .92, y: 70 }}
      transition={{ type: 'spring', stiffness: 430, damping: 35 }}
      onPointerDown={(event) => event.stopPropagation()}
    >
      <header className="macos-app-titlebar">
        <div className="macos-traffic-lights">
          <button type="button" className="close" onClick={onClose} aria-label={`Close ${title}`} />
          <button type="button" className="minimize" onClick={onClose} aria-label={`Minimize ${title}`} />
          <button type="button" className="zoom" onClick={() => setZoomed((value) => !value)} aria-label={`Zoom ${title}`} />
        </div>
        <strong>{title}</strong>
        <span />
      </header>
      {children}
    </Motion.section>
  )
}

function SafariWindow({ desktopRef, isMobile, onClose }) {
  const favorites = [
    { id: 'portfolio', label: 'Portfolio', url: profile.portfolio, mark: 'TJ' },
    { id: 'github', label: 'GitHub', url: profile.github, mark: 'GH' },
    { id: 'linkedin', label: 'LinkedIn', url: profile.linkedin, mark: 'in' }
  ]
  const highlights = getAllItems(false).filter((item) => item.link).slice(0, 4)

  return (
    <AppWindow app="safari-window" title="Safari" desktopRef={desktopRef} isMobile={isMobile} onClose={onClose}>
      <div className="macos-safari-toolbar">
        <div><button type="button" disabled>‹</button><button type="button" disabled>›</button></div>
        <label><i /><input readOnly value="stpcoder.github.io" aria-label="Safari address" /></label>
        <button type="button" className="safari-share" aria-label="Share"><i /></button>
      </div>
      <div className="macos-safari-page">
        <header><span>Start Page</span><h2>Favorites</h2></header>
        <div className="macos-safari-favorites">
          {favorites.map((favorite) => (
            <a key={favorite.id} href={favorite.url} target="_blank" rel="noopener noreferrer">
              <i className={favorite.id}>{favorite.mark}</i><strong>{favorite.label}</strong>
            </a>
          ))}
          <a href={`mailto:${profile.email}`}><i className="email">@</i><strong>Email</strong></a>
        </div>
        <section className="macos-reading-list">
          <h3>Reading List</h3>
          <div>
            {highlights.map((item) => (
              <a key={item.id} href={item.link} target="_blank" rel="noopener noreferrer">
                <span>{sectionLabel(item.section)}</span><strong>{item.title}</strong><small>{item.subtitle || item.period}</small>
              </a>
            ))}
          </div>
        </section>
      </div>
    </AppWindow>
  )
}

function MailWindow({ desktopRef, isMobile, onClose }) {
  const [subject, setSubject] = useState('Hello Taeho')
  const [message, setMessage] = useState('')
  const sendMail = () => {
    const query = new URLSearchParams({ subject, body: message })
    window.location.href = `mailto:${profile.email}?${query.toString()}`
  }

  return (
    <AppWindow app="mail-window" title="New Message" desktopRef={desktopRef} isMobile={isMobile} onClose={onClose}>
      <div className="macos-mail-toolbar">
        <button type="button" onClick={sendMail}>Send</button>
        <span>Compose</span>
      </div>
      <div className="macos-mail-layout">
        <aside>
          <strong>Favorites</strong>
          <button type="button" className="active"><i className="inbox" />Inbox <span>1</span></button>
          <button type="button"><i className="sent" />Sent</button>
          <button type="button"><i className="draft" />Drafts</button>
        </aside>
        <section className="macos-mail-compose">
          <label><span>To:</span><input readOnly value={`${profile.name} <${profile.email}>`} /></label>
          <label><span>Subject:</span><input value={subject} onChange={(event) => setSubject(event.target.value)} /></label>
          <textarea value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Write a message..." aria-label="Message" />
          <footer><span>{profile.location}</span><button type="button" onClick={sendMail}>Send Message</button></footer>
        </section>
      </div>
    </AppWindow>
  )
}

function SettingsWindow({ desktopRef, isMobile, onClose, wallpaper, setWallpaper, scale, setScale, vivid, setVivid }) {
  return (
    <AppWindow app="settings-window" title="System Settings" desktopRef={desktopRef} isMobile={isMobile} onClose={onClose}>
      <div className="macos-settings-layout">
        <aside>
          <div className="macos-settings-user"><i>TJ</i><span><strong>{profile.name}</strong><small>Portfolio</small></span></div>
          <button type="button" className="active"><DockIcon type="settings" /><span>Wallpaper</span></button>
        </aside>
        <section>
          <header><h2>Wallpaper</h2><p>Choose a desktop and tune it to your screen.</p></header>
          <div className="macos-wallpaper-preview"><div className={`wallpaper-${wallpaper}`} style={{ '--preview-scale': scale / 100, '--preview-vivid': vivid / 100 }}><i /><i /><i /></div><span /></div>
          <div className="macos-wallpaper-grid">
            {WALLPAPERS.map((item) => (
              <button type="button" key={item.id} className={wallpaper === item.id ? 'active' : ''} onClick={() => setWallpaper(item.id)}>
                <i className={`wallpaper-${item.id}`} /><span>{item.label}</span>
              </button>
            ))}
          </div>
          <label className="macos-settings-range"><span>Scale <b>{scale}%</b></span><input type="range" min="100" max="125" value={scale} onChange={(event) => setScale(Number(event.target.value))} /></label>
          <label className="macos-settings-range"><span>Vividness <b>{vivid}%</b></span><input type="range" min="70" max="130" value={vivid} onChange={(event) => setVivid(Number(event.target.value))} /></label>
        </section>
      </div>
    </AppWindow>
  )
}

function Dock({ windowOpen, minimized, activeApp, onFinder, onTerminal, onApp }) {
  return (
    <nav className="macos-dock" aria-label="Dock">
      <button onClick={onFinder}><DockIcon type="finder" /><span>Finder</span>{windowOpen && !minimized && <i className="running" />}</button>
      <button onClick={onTerminal}><DockIcon type="terminal" /><span>Terminal</span></button>
      <button onClick={() => onApp('safari')}><DockIcon type="safari" /><span>Safari</span>{activeApp === 'safari' && <i className="running" />}</button>
      <button onClick={() => onApp('mail')}><DockIcon type="mail" /><span>Mail</span>{activeApp === 'mail' && <i className="running" />}</button>
      <button onClick={() => onApp('settings')}><DockIcon type="settings" /><span>Settings</span>{activeApp === 'settings' && <i className="running" />}</button>
      <em />
      <button onClick={onFinder}><DockIcon type="folder" /><span>Portfolio</span></button>
      <button disabled><DockIcon type="trash" /><span>Trash</span></button>
    </nav>
  )
}

export default function MacOSDesktopView() {
  const { selectStyle } = useStyle()
  const desktopRef = useRef(null)
  const searchInputRef = useRef(null)
  const [isMobile, setIsMobile] = useState(() => window.matchMedia('(max-width: 760px)').matches)
  const [activeMenu, setActiveMenu] = useState(null)
  const [windowOpen, setWindowOpen] = useState(true)
  const [minimized, setMinimized] = useState(false)
  const [fullscreen, setFullscreen] = useState(false)
  const [section, setSection] = useState('')
  const [viewMode, setViewMode] = useState('icons')
  const [showAll, setShowAll] = useState(false)
  const [search, setSearch] = useState('')
  const [selectedId, setSelectedId] = useState(null)
  const [quickLookItem, setQuickLookItem] = useState(null)
  const [aboutOpen, setAboutOpen] = useState(false)
  const [activeApp, setActiveApp] = useState(null)
  const [wallpaper, setWallpaperState] = useState(() => {
    const saved = readPreference(WALLPAPER_KEY, 'sequoia')
    return WALLPAPERS.some(({ id }) => id === saved) ? saved : 'sequoia'
  })
  const [wallpaperScale, setWallpaperScaleState] = useState(() => Math.min(125, Math.max(100, Number(readPreference(WALLPAPER_SCALE_KEY, '100')) || 100)))
  const [wallpaperVivid, setWallpaperVividState] = useState(() => Math.min(130, Math.max(70, Number(readPreference(WALLPAPER_VIVID_KEY, '100')) || 100)))

  const selectedItem = useMemo(() => {
    if (!section || !selectedId) return null
    return getSectionItems(section, showAll).find((item) => item.id === selectedId) || null
  }, [section, selectedId, showAll])

  useEffect(() => {
    const query = window.matchMedia('(max-width: 760px)')
    const update = () => setIsMobile(query.matches)
    query.addEventListener?.('change', update)
    return () => query.removeEventListener?.('change', update)
  }, [])

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setQuickLookItem(null)
        setAboutOpen(false)
        setActiveMenu(null)
      }
      if (event.code === 'Space' && !activeApp && selectedItem && !(event.target instanceof HTMLInputElement)) {
        event.preventDefault()
        setQuickLookItem(selectedItem)
      }
      if (event.metaKey && event.key.toLowerCase() === 'f' && !activeApp) {
        event.preventDefault()
        searchInputRef.current?.focus()
      }
      if (event.metaKey && event.key.toLowerCase() === 'w') {
        event.preventDefault()
        if (activeApp) setActiveApp(null)
        else setWindowOpen(false)
      }
      if (event.metaKey && event.key.toLowerCase() === 'm') {
        event.preventDefault()
        if (activeApp) setActiveApp(null)
        else setMinimized(true)
      }
      if (event.metaKey && event.key === '1') setViewMode('icons')
      if (event.metaKey && event.key === '2') setViewMode('list')
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [activeApp, selectedItem])

  const openFinder = () => {
    setActiveApp(null)
    setWindowOpen(true)
    setMinimized(false)
  }

  const setWallpaper = (value) => {
    setWallpaperState(value)
    savePreference(WALLPAPER_KEY, value)
  }

  const setWallpaperScale = (value) => {
    setWallpaperScaleState(value)
    savePreference(WALLPAPER_SCALE_KEY, value)
  }

  const setWallpaperVivid = (value) => {
    setWallpaperVividState(value)
    savePreference(WALLPAPER_VIVID_KEY, value)
  }

  const handleMenuAction = (action) => {
    setActiveMenu(null)
    if (!action) return
    if (action === 'about') setAboutOpen(true)
    else if (action === 'settings') setActiveApp('settings')
    else if (action === 'open') openFinder()
    else if (action === 'close') activeApp ? setActiveApp(null) : setWindowOpen(false)
    else if (action === 'minimize') activeApp ? setActiveApp(null) : setMinimized(true)
    else if (action === 'zoom' && !activeApp) setFullscreen((value) => !value)
    else if (action === 'icons' || action === 'list') setViewMode(action)
    else if (action === 'archive') setShowAll((value) => !value)
    else if (action === 'focusSearch' && !activeApp) searchInputRef.current?.focus()
    else if (SECTION_META.some((entry) => entry.id === action)) {
      openFinder()
      setSection(action)
      setSearch('')
    }
  }

  const appName = activeApp === 'safari' ? 'Safari' : activeApp === 'mail' ? 'Mail' : activeApp === 'settings' ? 'System Settings' : 'Finder'

  return (
    <main className="macos-desktop" ref={desktopRef} onPointerDown={() => setActiveMenu(null)}>
      <div
        className={`macos-wallpaper wallpaper-${wallpaper}`}
        style={{ '--wallpaper-scale': wallpaperScale / 100, '--wallpaper-vivid': wallpaperVivid / 100 }}
        aria-hidden="true"
      ><i /><i /><i /></div>
      <MenuBar activeMenu={activeMenu} setActiveMenu={setActiveMenu} onAction={handleMenuAction} appName={appName} />

      <button className="macos-desktop-folder" onClick={openFinder} onDoubleClick={openFinder}><FolderIcon /><span>Portfolio</span></button>

      <AnimatePresence>
        {windowOpen && !minimized && (
          <FinderWindow
            desktopRef={desktopRef}
            isMobile={isMobile}
            section={section}
            setSection={setSection}
            viewMode={viewMode}
            setViewMode={setViewMode}
            showAll={showAll}
            setShowAll={setShowAll}
            search={search}
            setSearch={setSearch}
            selectedId={selectedId}
            setSelectedId={setSelectedId}
            onQuickLook={setQuickLookItem}
            onClose={() => setWindowOpen(false)}
            onMinimize={() => setMinimized(true)}
            fullscreen={fullscreen}
            onZoom={() => setFullscreen((value) => !value)}
            searchInputRef={searchInputRef}
          />
        )}
        {quickLookItem && <QuickLook item={quickLookItem} onClose={() => setQuickLookItem(null)} />}
        {aboutOpen && <AboutDialog onClose={() => setAboutOpen(false)} />}
        {activeApp === 'safari' && <SafariWindow desktopRef={desktopRef} isMobile={isMobile} onClose={() => setActiveApp(null)} />}
        {activeApp === 'mail' && <MailWindow desktopRef={desktopRef} isMobile={isMobile} onClose={() => setActiveApp(null)} />}
        {activeApp === 'settings' && (
          <SettingsWindow
            desktopRef={desktopRef}
            isMobile={isMobile}
            onClose={() => setActiveApp(null)}
            wallpaper={wallpaper}
            setWallpaper={setWallpaper}
            scale={wallpaperScale}
            setScale={setWallpaperScale}
            vivid={wallpaperVivid}
            setVivid={setWallpaperVivid}
          />
        )}
      </AnimatePresence>

      <Dock windowOpen={windowOpen} minimized={minimized} activeApp={activeApp} onFinder={openFinder} onTerminal={() => selectStyle(STYLES.TERMINAL)} onApp={setActiveApp} />
      <StyleSwitcher />
    </main>
  )
}
