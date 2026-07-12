import { AnimatePresence, MotionConfig, motion as Motion, useDragControls } from 'framer-motion'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import StyleSwitcher from '../StyleSwitcher'
import { STYLES, useStyle } from '../../contexts/StyleContext'
import { getAllItems, getSectionItems, profile, SECTION_META } from '../../lib/profileData'
import { CALCULATOR_INITIAL, pressCalculatorKey } from '../../lib/calculator'
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

function copyText(value) {
  if (!navigator.clipboard?.writeText) return Promise.reject(new Error('Clipboard unavailable'))
  return navigator.clipboard.writeText(value)
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
  if (type === 'calculator') return <span className="macos-dock-app calculator"><i><b /><b /><b /><b /></i></span>
  if (type === 'notes') return <span className="macos-dock-app notes"><i /><b /><b /><b /></span>
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

const APP_NAMES = {
  safari: 'Safari',
  mail: 'Mail',
  calculator: 'Calculator',
  notes: 'Notes',
  settings: 'System Settings'
}

const APPLE_MENU = [
  { label: 'About This Portfolio', action: 'about' },
  { separator: true },
  { label: 'System Settings...', action: 'settings', shortcut: '⌘,' },
  { separator: true },
  { label: 'Lock Screen', disabled: true, shortcut: '⌃⌘Q' }
]

function buildMenus({
  activeApp,
  activeWindow,
  appName,
  editingText,
  fullscreen,
  minimized,
  minimizedApps,
  openApps,
  section,
  selectedItem,
  showAll,
  sidebarOpen,
  viewMode,
  windowOpen,
  zoomedApps
}) {
  const finderVisible = windowOpen && !minimized
  const visibleApps = openApps.filter((app) => !minimizedApps.includes(app))
  const currentWindowVisible = activeWindow === 'finder'
    ? finderVisible
    : Boolean(activeWindow && openApps.includes(activeWindow) && !minimizedApps.includes(activeWindow))
  const currentWindowZoomed = activeWindow === 'finder'
    ? fullscreen
    : Boolean(activeWindow && zoomedApps.includes(activeWindow))
  const otherWindowsVisible = activeApp
    ? finderVisible || visibleApps.some((app) => app !== activeApp)
    : visibleApps.length > 0
  const hiddenWindows = (windowOpen && minimized) || minimizedApps.length > 0
  const finderSelection = activeWindow === 'finder' ? selectedItem : null
  const selectedTitle = finderSelection?.title
  const editEnabled = editingText || Boolean(finderSelection)

  const appMenu = [
    { label: `About ${appName}`, action: 'about' },
    { label: 'Settings...', action: 'settings', shortcut: '⌘,' },
    { separator: true },
    { label: 'Services', disabled: true, submenu: true },
    { separator: true },
    { label: `Hide ${appName}`, action: 'hide', disabled: activeApp ? !currentWindowVisible : !finderVisible, shortcut: '⌘H' },
    { label: 'Hide Others', action: 'hideOthers', disabled: !otherWindowsVisible, shortcut: '⌥⌘H' },
    { label: 'Show All', action: 'showAllWindows', disabled: !hiddenWindows },
    { separator: true },
    { label: `Quit ${appName}`, action: 'quit', disabled: !activeApp, shortcut: '⌘Q' }
  ]

  const fileMenu = activeApp ? [
    { label: 'Close Window', action: 'close', disabled: !currentWindowVisible, shortcut: '⌘W' }
  ] : [
    { label: 'New Finder Window', action: 'new', shortcut: '⌘N' },
    { separator: true },
    { label: selectedTitle ? `Open “${selectedTitle}”` : 'Open', action: 'openSelected', disabled: !finderSelection, shortcut: '⌘O' },
    { label: selectedTitle ? `Quick Look “${selectedTitle}”` : 'Quick Look', action: 'quicklookSelected', disabled: !finderSelection, shortcut: 'Space' },
    { separator: true },
    { label: 'Close Window', action: 'close', disabled: !currentWindowVisible, shortcut: '⌘W' }
  ]

  const editMenu = [
    { label: editingText ? 'Undo Typing' : 'Undo', action: 'undo', disabled: !editingText, shortcut: '⌘Z' },
    { label: 'Redo', action: 'redo', disabled: !editingText, shortcut: '⇧⌘Z' },
    { separator: true },
    { label: 'Cut', action: 'cut', disabled: !editingText, shortcut: '⌘X' },
    { label: selectedTitle && !editingText ? `Copy “${selectedTitle}”` : 'Copy', action: 'copy', disabled: !editEnabled, shortcut: '⌘C' },
    { label: 'Paste', action: 'paste', disabled: !editingText, shortcut: '⌘V' },
    { label: 'Select All', action: 'selectAll', disabled: !editingText, shortcut: '⌘A' },
    ...(!activeApp ? [{ separator: true }, { label: 'Find...', action: 'focusSearch', shortcut: '⌘F' }] : [])
  ]

  const viewMenu = activeApp ? [
    { label: currentWindowZoomed ? 'Exit Full Screen' : 'Enter Full Screen', action: 'zoom', disabled: !currentWindowVisible, shortcut: '⌃⌘F' }
  ] : [
    { label: 'as Icons', action: 'icons', checked: viewMode === 'icons', shortcut: '⌘1' },
    { label: 'as List', action: 'list', checked: viewMode === 'list', shortcut: '⌘2' },
    { separator: true },
    { label: sidebarOpen ? 'Hide Sidebar' : 'Show Sidebar', action: 'toggleSidebar', shortcut: '⌃⌘S' },
    { label: showAll ? 'Show Featured Only' : 'Show All Records', action: 'archive', shortcut: '⌥⌘A' },
    { separator: true },
    { label: fullscreen ? 'Exit Full Screen' : 'Enter Full Screen', action: 'zoom', disabled: !currentWindowVisible, shortcut: '⌃⌘F' }
  ]

  const windowItems = []
  if (windowOpen) {
    windowItems.push({
      label: section ? sectionLabel(section) : 'Portfolio',
      action: 'focusWindow:finder',
      checked: activeWindow === 'finder',
      minimized
    })
  }
  openApps.forEach((app) => {
    windowItems.push({
      label: APP_NAMES[app],
      action: `focusWindow:${app}`,
      checked: activeWindow === app,
      minimized: minimizedApps.includes(app)
    })
  })

  const menus = [
    { id: 'app', label: appName, items: appMenu },
    { id: 'file', label: 'File', items: fileMenu },
    { id: 'edit', label: 'Edit', items: editMenu },
    { id: 'view', label: 'View', items: viewMenu }
  ]

  if (!activeApp) {
    menus.push({
      id: 'go',
      label: 'Go',
      items: SECTION_META.map((entry, index) => ({
        label: entry.label,
        action: entry.id,
        checked: section === entry.id,
        shortcut: `⌥⌘${index + 1}`
      }))
    })
  }

  menus.push(
    {
      id: 'window',
      label: 'Window',
      items: [
        { label: 'Minimize', action: 'minimize', disabled: !currentWindowVisible, shortcut: '⌘M' },
        { label: currentWindowZoomed ? 'Exit Full Screen' : 'Zoom', action: 'zoom', disabled: !currentWindowVisible, shortcut: '⌃⌘F' },
        { separator: true },
        { label: 'Bring All to Front', action: 'showAllWindows', disabled: !hiddenWindows },
        ...(windowItems.length ? [{ separator: true }, ...windowItems] : [])
      ]
    },
    { id: 'help', label: 'Help', items: [{ label: `${appName} Help`, action: 'about' }] }
  )

  return menus
}

function MenuBar({ activeMenu, setActiveMenu, onAction, menus }) {
  const time = useClock()

  return (
    <header className="macos-menu-bar" onPointerDown={(event) => event.stopPropagation()}>
      <div className="macos-menu-left">
        <div className="macos-menu-wrap">
          <button
            className={activeMenu === 'apple' ? 'active' : ''}
            onPointerDown={(event) => event.preventDefault()}
            onPointerEnter={() => activeMenu && setActiveMenu('apple')}
            onClick={() => setActiveMenu(activeMenu === 'apple' ? null : 'apple')}
            aria-label="Apple menu"
            aria-haspopup="menu"
            aria-expanded={activeMenu === 'apple'}
          ><AppleMark /></button>
          {activeMenu === 'apple' && <MenuDropdown items={APPLE_MENU} onAction={onAction} />}
        </div>
        {menus.map((menu, index) => (
          <div className="macos-menu-wrap" key={menu.id}>
            <button
              className={`${index === 0 ? 'app-name' : ''} ${activeMenu === menu.id ? 'active' : ''}`}
              onPointerDown={(event) => event.preventDefault()}
              onPointerEnter={() => activeMenu && setActiveMenu(menu.id)}
              onClick={() => setActiveMenu(activeMenu === menu.id ? null : menu.id)}
              aria-haspopup="menu"
              aria-expanded={activeMenu === menu.id}
            >{menu.label}</button>
            {activeMenu === menu.id && <MenuDropdown items={menu.items} onAction={onAction} />}
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
    <Motion.div className="macos-dropdown" role="menu" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.1 }}>
      {items.map((item, index) => item.separator ? <hr key={`separator-${index}`} /> : (
        <button
          key={`${item.action || item.label}-${index}`}
          type="button"
          role={typeof item.checked === 'boolean' ? 'menuitemcheckbox' : 'menuitem'}
          aria-checked={typeof item.checked === 'boolean' ? item.checked : undefined}
          disabled={item.disabled}
          onPointerDown={(event) => event.preventDefault()}
          onClick={() => onAction(item.action)}
        >
          <span className="macos-menu-item-label">
            <i aria-hidden="true">{item.checked ? '✓' : item.minimized ? '◆' : ''}</i>
            <span>{item.label}</span>
            {item.submenu && <b aria-hidden="true">›</b>}
          </span>
          {item.shortcut && <kbd>{item.shortcut}</kbd>}
        </button>
      ))}
    </Motion.div>
  )
}

function ContextMenu({ menu, onAction, onClose }) {
  if (!menu) return null
  const items = menu.type === 'record'
    ? [{ label: 'Open', action: 'open' }, { label: 'Quick Look', action: 'quicklook', shortcut: 'Space' }, ...(menu.item.link ? [{ label: 'Open Original', action: 'link' }] : []), { separator: true }, { label: 'Copy Name', action: 'copy', shortcut: '⌘C' }]
    : menu.type === 'section'
      ? [{ label: 'Open', action: 'open' }, { separator: true }, { label: 'Get Info', action: 'info' }]
      : menu.type === 'desktop-icon'
        ? [{ label: 'Open', action: 'open' }, { separator: true }, { label: 'Get Info', action: 'info' }]
        : menu.type === 'dock-app'
          ? [
              { label: menu.open ? (menu.minimized ? 'Show' : 'Bring to Front') : 'Open', action: 'dockOpen' },
              { separator: true },
              { label: `Hide ${menu.label}`, action: 'dockHide', disabled: !menu.open || menu.minimized },
              { label: `Quit ${menu.label}`, action: 'dockQuit', disabled: !menu.open || menu.app === 'finder' }
            ]
          : [
              { label: 'New Finder Window', action: 'new' },
              { separator: true },
              { label: 'Change Wallpaper...', action: 'settings' },
              { label: 'Show View Options', disabled: true }
            ]

  return (
    <div className="macos-context-layer" onPointerDown={(event) => { event.stopPropagation(); onClose() }} onContextMenu={(event) => event.preventDefault()}>
      <Motion.div className="macos-context-menu" role="menu" style={{ left: menu.x, top: menu.y }} initial={{ opacity: 0, scale: .96 }} animate={{ opacity: 1, scale: 1 }} onPointerDown={(event) => event.stopPropagation()}>
        {items.map((item, index) => item.separator ? <hr key={`context-${index}`} /> : (
          <button type="button" role="menuitem" key={`${item.action || item.label}-${index}`} disabled={item.disabled} onClick={() => onAction(item.action)}>
            <span>{item.label}</span>{item.shortcut && <kbd>{item.shortcut}</kbd>}
          </button>
        ))}
      </Motion.div>
    </div>
  )
}

function FinderHome({ showAll, onOpen, onContextMenu }) {
  const [selectedSection, setSelectedSection] = useState(null)

  return (
    <div className="macos-folder-view">
      {SECTION_META.map((section, index) => (
        <button
          type="button"
          key={section.id}
          className={`macos-folder-item ${selectedSection === section.id ? 'selected' : ''}`}
          onClick={() => setSelectedSection(section.id)}
          onDoubleClick={() => onOpen(section.id)}
          onFocus={() => setSelectedSection(section.id)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault()
              onOpen(section.id)
            }
          }}
          onContextMenu={(event) => { setSelectedSection(section.id); onContextMenu(event, section) }}
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

function FinderRecords({ items, viewMode, selectedId, onSelect, onOpen, onContextMenu }) {
  if (viewMode === 'icons') {
    return (
      <div className="macos-record-icon-view">
        {items.map((item) => (
          <button type="button" key={item.id} className={selectedId === item.id ? 'selected' : ''} onClick={() => onSelect(item.id)} onDoubleClick={() => onOpen(item)} onContextMenu={(event) => { onSelect(item.id); onContextMenu(event, item) }}>
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
        <button type="button" key={item.id} className={selectedId === item.id ? 'selected' : ''} onClick={() => onSelect(item.id)} onDoubleClick={() => onOpen(item)} onContextMenu={(event) => { onSelect(item.id); onContextMenu(event, item) }}>
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
    <Motion.div className="macos-quicklook-layer" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onPointerDown={(event) => { event.stopPropagation(); onClose() }}>
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
    <Motion.div className="macos-about-layer" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onPointerDown={(event) => { event.stopPropagation(); onClose() }}>
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
  minimized,
  fullscreen,
  onZoom,
  searchInputRef,
  sidebarOpen,
  onToggleSidebar,
  active,
  onFocus,
  onContextMenu
}) {
  const dragControls = useDragControls()
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
      className={`macos-finder-window ${fullscreen ? 'fullscreen' : ''} ${minimized ? 'minimized' : ''} ${active ? 'active' : 'inactive'}`}
      style={{ zIndex: active ? 120 : 30, pointerEvents: minimized ? 'none' : 'auto' }}
      drag={!fullscreen && !isMobile}
      dragControls={dragControls}
      dragListener={false}
      dragConstraints={desktopRef}
      dragMomentum={false}
      initial={{ opacity: 0, scale: 0.96 }}
      animate={minimized ? { opacity: 0, scale: 0.72 } : { opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 420, damping: 34 }}
      aria-hidden={minimized}
      inert={minimized ? true : undefined}
      onPointerDown={(event) => { event.stopPropagation(); onFocus() }}
    >
      <header className="macos-finder-toolbar macos-window-drag-handle" onPointerDown={(event) => {
        if (!fullscreen && !isMobile && !event.target.closest('button,input,label')) dragControls.start(event)
      }} onDoubleClick={(event) => {
        if (!event.target.closest('button,input,label')) onZoom()
      }}>
        <div className="macos-traffic-lights">
          <button className="close" onClick={onClose} aria-label="Close Finder" />
          <button className="minimize" onClick={onMinimize} aria-label="Minimize Finder" />
          <button className="zoom" onClick={onZoom} aria-label="Zoom Finder" />
        </div>
        <div className="macos-nav-buttons">
          <button className="macos-sidebar-toggle" onClick={onToggleSidebar} aria-label={sidebarOpen ? 'Hide sidebar' : 'Show sidebar'}><i /></button>
          <button onClick={() => { setSection(''); setSelectedId(null) }} disabled={!section && !search} aria-label="Back">‹</button>
          <button disabled aria-label="Forward">›</button>
        </div>
        <h1>{search ? 'Search' : activeMeta?.label || 'Portfolio'}</h1>
        <div className="macos-view-control">
          <button className={viewMode === 'icons' ? 'active' : ''} onClick={() => setViewMode('icons')} aria-label="Icon view"><i className="grid-icon" /></button>
          <button className={viewMode === 'list' ? 'active' : ''} onClick={() => setViewMode('list')} aria-label="List view"><i className="list-icon" /></button>
        </div>
        <label className="macos-search-field"><span /><input ref={searchInputRef} value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search" aria-label="Search portfolio" /></label>
      </header>

      <div className={`macos-finder-layout ${sidebarOpen ? '' : 'sidebar-hidden'}`}>
        {sidebarOpen ? <aside className="macos-finder-sidebar">
          <span>Favorites</span>
          <button className={!section ? 'active' : ''} onClick={() => { setSection(''); setSearch('') }}><SidebarIcon type="home" />Portfolio</button>
          {SECTION_META.map((entry) => (
            <button key={entry.id} className={section === entry.id ? 'active' : ''} onClick={() => { setSection(entry.id); setSearch(''); setSelectedId(null) }}>
              <SidebarIcon type={entry.id} />{entry.label}
            </button>
          ))}
          <span>Display</span>
          <button className={showAll ? 'active' : ''} onClick={() => setShowAll((value) => !value)}><i className="macos-archive-dot" />{showAll ? 'All Records' : 'Featured'}</button>
        </aside> : null}

        <div className="macos-finder-content">
          <div className="macos-content-heading">
            <div>
              <h2>{search ? `Results for "${search}"` : activeMeta?.label || profile.name}</h2>
              <p>{search ? `${items.length} matches` : activeMeta ? `${items.length} items` : profile.title}</p>
            </div>
          </div>

          {!section && !search
            ? <FinderHome showAll={showAll} onOpen={(id) => { setSection(id); setSelectedId(null) }} onContextMenu={(event, item) => onContextMenu(event, { type: 'section', item })} />
            : <FinderRecords items={items} viewMode={viewMode} selectedId={selectedId} onSelect={setSelectedId} onOpen={onQuickLook} onContextMenu={(event, item) => onContextMenu(event, { type: 'record', item })} />}
        </div>
      </div>

      <footer className="macos-status-bar">
        <span>{section ? `${items.length} items` : `${SECTION_META.length} folders`}</span>
        <span>Press Space for Quick Look</span>
      </footer>
    </Motion.section>
  )
}

function AppWindow({ app, title, desktopRef, isMobile, onClose, onMinimize, onFocus, onZoom, active, minimized, zoomed, children }) {
  const dragControls = useDragControls()

  return (
    <Motion.section
      className={`macos-app-window ${app} ${zoomed ? 'zoomed' : ''} ${minimized ? 'minimized' : ''} ${active ? 'active' : 'inactive'}`}
      style={{ zIndex: active ? 120 : 80, pointerEvents: minimized ? 'none' : 'auto' }}
      drag={!zoomed && !isMobile}
      dragControls={dragControls}
      dragListener={false}
      dragConstraints={desktopRef}
      dragMomentum={false}
      initial={{ opacity: 0, scale: .96 }}
      animate={minimized ? { opacity: 0, scale: .72 } : { opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: .92 }}
      transition={{ type: 'spring', stiffness: 430, damping: 35 }}
      aria-hidden={minimized}
      inert={minimized ? true : undefined}
      onPointerDown={(event) => { event.stopPropagation(); onFocus() }}
    >
      <header className="macos-app-titlebar macos-window-drag-handle" onPointerDown={(event) => {
        if (!zoomed && !isMobile && !event.target.closest('button')) dragControls.start(event)
      }} onDoubleClick={(event) => {
        if (!event.target.closest('button')) onZoom()
      }}>
        <div className="macos-traffic-lights">
          <button type="button" className="close" onClick={onClose} aria-label={`Close ${title}`} />
          <button type="button" className="minimize" onClick={onMinimize} aria-label={`Minimize ${title}`} />
          <button type="button" className="zoom" onClick={onZoom} aria-label={`Zoom ${title}`} />
        </div>
        <strong>{title}</strong>
        <span />
      </header>
      {children}
    </Motion.section>
  )
}

function SafariWindow({ desktopRef, isMobile, onClose, onMinimize, onFocus, onZoom, active, minimized, zoomed }) {
  const [shareStatus, setShareStatus] = useState('')
  const favorites = [
    { id: 'portfolio', label: 'Portfolio', url: profile.portfolio, mark: 'TJ' },
    { id: 'github', label: 'GitHub', url: profile.github, mark: 'GH' },
    { id: 'linkedin', label: 'LinkedIn', url: profile.linkedin, mark: 'in' }
  ]
  const highlights = getAllItems(false).filter((item) => item.link).slice(0, 4)

  useEffect(() => {
    if (!shareStatus) return undefined
    const timer = window.setTimeout(() => setShareStatus(''), 1800)
    return () => window.clearTimeout(timer)
  }, [shareStatus])

  const sharePortfolio = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title: `${profile.name} - Portfolio`, url: profile.portfolio })
        setShareStatus('Shared')
      } else {
        await copyText(profile.portfolio)
        setShareStatus('Link copied')
      }
    } catch (error) {
      if (error?.name !== 'AbortError') setShareStatus('Unable to share')
    }
  }

  return (
    <AppWindow app="safari-window" title="Safari" desktopRef={desktopRef} isMobile={isMobile} onClose={onClose} onMinimize={onMinimize} onFocus={onFocus} onZoom={onZoom} active={active} minimized={minimized} zoomed={zoomed}>
      <div className="macos-safari-toolbar">
        <div><button type="button" disabled>‹</button><button type="button" disabled>›</button></div>
        <label><i /><input readOnly value="stpcoder.github.io" aria-label="Safari address" /></label>
        <button type="button" className="safari-share" onClick={sharePortfolio} aria-label="Share portfolio"><i />{shareStatus && <span role="status">{shareStatus}</span>}</button>
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

function MailWindow({ desktopRef, isMobile, onClose, onMinimize, onFocus, onZoom, active, minimized, zoomed }) {
  const [subject, setSubject] = useState('Hello Taeho')
  const [message, setMessage] = useState('')
  const sendMail = () => {
    const query = new URLSearchParams({ subject, body: message })
    window.location.href = `mailto:${profile.email}?${query.toString()}`
  }

  return (
    <AppWindow app="mail-window" title="New Message" desktopRef={desktopRef} isMobile={isMobile} onClose={onClose} onMinimize={onMinimize} onFocus={onFocus} onZoom={onZoom} active={active} minimized={minimized} zoomed={zoomed}>
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

function SettingsWindow({ desktopRef, isMobile, onClose, onMinimize, onFocus, onZoom, active, minimized, zoomed, wallpaper, setWallpaper, scale, setScale, vivid, setVivid }) {
  return (
    <AppWindow app="settings-window" title="System Settings" desktopRef={desktopRef} isMobile={isMobile} onClose={onClose} onMinimize={onMinimize} onFocus={onFocus} onZoom={onZoom} active={active} minimized={minimized} zoomed={zoomed}>
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

function CalculatorWindow({ desktopRef, isMobile, onClose, onMinimize, onFocus, onZoom, active, minimized, zoomed }) {
  const [calculator, setCalculator] = useState(CALCULATOR_INITIAL)

  const press = useCallback((key) => {
    setCalculator((current) => pressCalculatorKey(current, key))
  }, [])

  useEffect(() => {
    if (!active) return undefined
    const keyDown = (event) => {
      const mapped = { Enter: '=', '=': '=', '+': '+', '-': '−', '*': '×', '/': '÷', Escape: 'AC', Backspace: 'backspace', '.': '.' }[event.key] || (/^\d$/.test(event.key) ? event.key : '')
      if (!mapped) return
      event.preventDefault()
      press(mapped)
    }
    window.addEventListener('keydown', keyDown)
    return () => window.removeEventListener('keydown', keyDown)
  }, [active, press])

  const keys = ['AC', '+/-', '%', '÷', '7', '8', '9', '×', '4', '5', '6', '−', '1', '2', '3', '+', '0', '.', '=']

  return (
    <AppWindow app="calculator-window" title="Calculator" desktopRef={desktopRef} isMobile={isMobile} onClose={onClose} onMinimize={onMinimize} onFocus={onFocus} onZoom={onZoom} active={active} minimized={minimized} zoomed={zoomed}>
      <div className="macos-calculator">
        <div className="macos-calculator-display"><span>{calculator.operator || ''}</span><output>{calculator.display}</output></div>
        <div className="macos-calculator-keypad">
          {keys.map((key) => (
            <button
              type="button"
              key={key}
              className={`${['÷', '×', '−', '+', '='].includes(key) ? 'operator' : ''} ${key === '0' ? 'zero' : ''}`}
              onClick={() => press(key)}
              aria-label={key}
            >{key}</button>
          ))}
        </div>
      </div>
    </AppWindow>
  )
}

const NOTES_KEY = 'portfolio-macos-notes-v1'

function initialNotes() {
  try {
    const parsed = JSON.parse(readPreference(NOTES_KEY, '[]'))
    if (Array.isArray(parsed) && parsed.length) return parsed
  } catch {
    // Fall through to a local starter note.
  }
  return [{ id: 'portfolio-note', title: 'Portfolio Notes', body: 'Ideas, questions, and things to remember about Taeho\'s work.', updatedAt: Date.now() }]
}

function NotesWindow({ desktopRef, isMobile, onClose, onMinimize, onFocus, onZoom, active, minimized, zoomed }) {
  const [notes, setNotes] = useState(initialNotes)
  const [selectedId, setSelectedId] = useState(() => initialNotes()[0].id)
  const selectedNote = notes.find(({ id }) => id === selectedId) || notes[0]

  useEffect(() => { savePreference(NOTES_KEY, JSON.stringify(notes)) }, [notes])

  const addNote = useCallback(() => {
    const note = { id: `note-${Date.now()}`, title: 'New Note', body: '', updatedAt: Date.now() }
    setNotes((current) => [note, ...current])
    setSelectedId(note.id)
  }, [])

  const updateNote = (field, value) => {
    setNotes((current) => current.map((note) => note.id === selectedNote.id ? { ...note, [field]: value, updatedAt: Date.now() } : note))
  }

  const deleteNote = useCallback(() => {
    setNotes((current) => {
      if (current.length === 1) return [{ ...current[0], title: 'New Note', body: '', updatedAt: Date.now() }]
      const next = current.filter(({ id }) => id !== selectedId)
      setSelectedId(next[0].id)
      return next
    })
  }, [selectedId])

  useEffect(() => {
    if (!active) return undefined
    const shortcuts = (event) => {
      if (event.metaKey && event.key.toLowerCase() === 'n') { event.preventDefault(); addNote() }
      if (event.metaKey && event.key === 'Backspace') { event.preventDefault(); deleteNote() }
    }
    window.addEventListener('keydown', shortcuts)
    return () => window.removeEventListener('keydown', shortcuts)
  }, [active, addNote, deleteNote])

  return (
    <AppWindow app="notes-window" title={selectedNote?.title || 'Notes'} desktopRef={desktopRef} isMobile={isMobile} onClose={onClose} onMinimize={onMinimize} onFocus={onFocus} onZoom={onZoom} active={active} minimized={minimized} zoomed={zoomed}>
      <div className="macos-notes-toolbar">
        <button type="button" onClick={addNote} aria-label="New note"><i className="notes-compose" /></button>
        <strong>Notes</strong>
        <button type="button" onClick={deleteNote} aria-label="Delete note"><i className="notes-delete" /></button>
      </div>
      <div className="macos-notes-layout">
        <aside>
          {notes.map((note) => (
            <button type="button" key={note.id} className={note.id === selectedNote.id ? 'active' : ''} onClick={() => setSelectedId(note.id)}>
              <strong>{note.title || 'Untitled'}</strong>
              <span>{new Date(note.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
              <p>{note.body || 'No additional text'}</p>
            </button>
          ))}
        </aside>
        <section>
          <time>{new Date(selectedNote.updatedAt).toLocaleString('en-US', { month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</time>
          <input value={selectedNote.title} onChange={(event) => updateNote('title', event.target.value)} aria-label="Note title" />
          <textarea value={selectedNote.body} onChange={(event) => updateNote('body', event.target.value)} placeholder="Start typing..." aria-label="Note body" />
        </section>
      </div>
    </AppWindow>
  )
}

function Dock({ activeWindow, windowOpen, minimized, openApps, minimizedApps, onFinder, onTerminal, onApp, onContextMenu }) {
  const apps = ['safari', 'mail', 'calculator', 'notes', 'settings']

  return (
    <nav className="macos-dock" aria-label="Dock" onPointerDown={(event) => event.stopPropagation()}>
      <button
        type="button"
        className={`${activeWindow === 'finder' ? 'active' : ''} ${minimized ? 'minimized-app' : ''}`}
        onClick={onFinder}
        onContextMenu={(event) => onContextMenu(event, { type: 'dock-app', app: 'finder', label: 'Finder', open: windowOpen, minimized })}
        aria-label="Finder"
      ><DockIcon type="finder" /><span>Finder</span><i className="running" /></button>
      <button
        type="button"
        onClick={onTerminal}
        onContextMenu={(event) => onContextMenu(event, { type: 'dock-app', app: 'terminal', label: 'Terminal', open: false, minimized: false })}
        aria-label="Terminal"
      ><DockIcon type="terminal" /><span>Terminal</span></button>
      {apps.map((app) => {
        const open = openApps.includes(app)
        const appMinimized = minimizedApps.includes(app)
        return (
          <button
            type="button"
            key={app}
            className={`${activeWindow === app ? 'active' : ''} ${appMinimized ? 'minimized-app' : ''}`}
            onClick={() => onApp(app)}
            onContextMenu={(event) => onContextMenu(event, { type: 'dock-app', app, label: APP_NAMES[app], open, minimized: appMinimized })}
            aria-label={APP_NAMES[app]}
          >
            <DockIcon type={app} /><span>{APP_NAMES[app]}</span>{open && <i className="running" />}
          </button>
        )
      })}
      <em />
      <button type="button" onClick={onFinder} onContextMenu={(event) => onContextMenu(event, { type: 'desktop-icon' })} aria-label="Portfolio folder"><DockIcon type="folder" /><span>Portfolio</span></button>
      <button type="button" disabled aria-label="Trash"><DockIcon type="trash" /><span>Trash</span></button>
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
  const [activeWindow, setActiveWindow] = useState('finder')
  const [openApps, setOpenApps] = useState([])
  const [minimizedApps, setMinimizedApps] = useState([])
  const [zoomedApps, setZoomedApps] = useState([])
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [contextMenu, setContextMenu] = useState(null)
  const [desktopIconSelected, setDesktopIconSelected] = useState(false)
  const [editingText, setEditingText] = useState(false)
  const [wallpaper, setWallpaperState] = useState(() => {
    const saved = readPreference(WALLPAPER_KEY, 'sequoia')
    return WALLPAPERS.some(({ id }) => id === saved) ? saved : 'sequoia'
  })
  const [wallpaperScale, setWallpaperScaleState] = useState(() => Math.min(125, Math.max(100, Number(readPreference(WALLPAPER_SCALE_KEY, '100')) || 100)))
  const [wallpaperVivid, setWallpaperVividState] = useState(() => Math.min(130, Math.max(70, Number(readPreference(WALLPAPER_VIVID_KEY, '100')) || 100)))
  const activeApp = activeWindow && activeWindow !== 'finder' ? activeWindow : null

  const selectedItem = useMemo(() => {
    if (!section || !selectedId) return null
    return getSectionItems(section, showAll).find((item) => item.id === selectedId) || null
  }, [section, selectedId, showAll])

  const openFinder = useCallback(() => {
    setActiveWindow('finder')
    setWindowOpen(true)
    setMinimized(false)
    setActiveMenu(null)
  }, [])

  const openApp = useCallback((app) => {
    setOpenApps((current) => [...current.filter((entry) => entry !== app), app])
    setMinimizedApps((current) => current.filter((entry) => entry !== app))
    setActiveWindow(app)
    setActiveMenu(null)
  }, [])

  const focusNextWindow = useCallback((excluded, nextOpenApps = openApps, nextMinimizedApps = minimizedApps) => {
    const nextApp = [...nextOpenApps].reverse().find((app) => app !== excluded && !nextMinimizedApps.includes(app))
    if (nextApp) setActiveWindow(nextApp)
    else if (excluded !== 'finder' && windowOpen && !minimized) setActiveWindow('finder')
    else setActiveWindow(null)
  }, [minimized, minimizedApps, openApps, windowOpen])

  const closeApp = useCallback((app) => {
    const nextOpenApps = openApps.filter((entry) => entry !== app)
    setOpenApps(nextOpenApps)
    setMinimizedApps((current) => current.filter((entry) => entry !== app))
    setZoomedApps((current) => current.filter((entry) => entry !== app))
    if (activeWindow === app) focusNextWindow(app, nextOpenApps)
  }, [activeWindow, focusNextWindow, openApps])

  const minimizeApp = useCallback((app) => {
    const nextMinimizedApps = minimizedApps.includes(app) ? minimizedApps : [...minimizedApps, app]
    setMinimizedApps(nextMinimizedApps)
    if (activeWindow === app) focusNextWindow(app, openApps, nextMinimizedApps)
  }, [activeWindow, focusNextWindow, minimizedApps, openApps])

  const closeFinder = useCallback(() => {
    setWindowOpen(false)
    setMinimized(false)
    setFullscreen(false)
    if (activeWindow === 'finder') focusNextWindow('finder')
  }, [activeWindow, focusNextWindow])

  const minimizeFinder = useCallback(() => {
    if (!windowOpen) return
    setMinimized(true)
    if (activeWindow === 'finder') focusNextWindow('finder')
  }, [activeWindow, focusNextWindow, windowOpen])

  const focusWindow = useCallback((windowId) => {
    if (windowId === 'finder') openFinder()
    else openApp(windowId)
  }, [openApp, openFinder])

  const showAllWindows = useCallback(() => {
    setMinimized(false)
    setMinimizedApps([])
    if (!activeWindow) {
      if (windowOpen) setActiveWindow('finder')
      else if (openApps.length) setActiveWindow(openApps[openApps.length - 1])
    }
  }, [activeWindow, openApps, windowOpen])

  const hideOtherWindows = useCallback(() => {
    if (activeApp) {
      if (windowOpen) setMinimized(true)
      setMinimizedApps(openApps.filter((app) => app !== activeApp))
      setActiveWindow(activeApp)
      return
    }
    setMinimizedApps([...openApps])
    if (windowOpen) {
      setMinimized(false)
      setActiveWindow('finder')
    } else {
      setActiveWindow(null)
    }
  }, [activeApp, openApps, windowOpen])

  const cycleWindows = useCallback((reverse = false) => {
    const visibleWindows = [
      ...(windowOpen && !minimized ? ['finder'] : []),
      ...openApps.filter((app) => !minimizedApps.includes(app))
    ]
    if (!visibleWindows.length) return
    const currentIndex = visibleWindows.indexOf(activeWindow)
    const offset = reverse ? -1 : 1
    const nextIndex = currentIndex < 0
      ? reverse ? visibleWindows.length - 1 : 0
      : (currentIndex + offset + visibleWindows.length) % visibleWindows.length
    setActiveWindow(visibleWindows[nextIndex])
  }, [activeWindow, minimized, minimizedApps, openApps, windowOpen])

  const toggleAppZoom = useCallback((app) => {
    setZoomedApps((current) => current.includes(app) ? current.filter((entry) => entry !== app) : [...current, app])
    setActiveWindow(app)
  }, [])

  const showContextMenu = useCallback((event, menu) => {
    event.preventDefault()
    event.stopPropagation()
    setActiveMenu(null)
    setContextMenu({
      ...menu,
      x: Math.max(8, Math.min(event.clientX, window.innerWidth - 210)),
      y: Math.max(36, Math.min(event.clientY, window.innerHeight - 220))
    })
  }, [])

  useEffect(() => {
    const query = window.matchMedia('(max-width: 760px)')
    const update = () => setIsMobile(query.matches)
    query.addEventListener?.('change', update)
    return () => query.removeEventListener?.('change', update)
  }, [])

  useEffect(() => {
    const handleKeyDown = (event) => {
      const targetIsText = event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement || event.target?.isContentEditable

      if (event.key === 'Escape') {
        setQuickLookItem(null)
        setAboutOpen(false)
        setActiveMenu(null)
        setContextMenu(null)
      }
      if (event.metaKey && event.key === '`') {
        event.preventDefault()
        cycleWindows(event.shiftKey)
        return
      }
      if (event.metaKey && event.altKey && event.key.toLowerCase() === 'h') {
        event.preventDefault()
        hideOtherWindows()
        return
      }
      if (event.metaKey && event.altKey && /^\d$/.test(event.key) && !activeApp) {
        const entry = SECTION_META[Number(event.key) - 1]
        if (entry) {
          event.preventDefault()
          openFinder()
          setSection(entry.id)
          setSearch('')
        }
        return
      }
      if (event.code === 'Space' && activeWindow === 'finder' && selectedItem && !targetIsText) {
        event.preventDefault()
        setQuickLookItem(selectedItem)
      }
      if (activeWindow === 'finder' && section && ['ArrowLeft', 'ArrowUp', 'ArrowRight', 'ArrowDown'].includes(event.key) && !targetIsText) {
        event.preventDefault()
        const items = getSectionItems(section, showAll)
        const direction = event.key === 'ArrowLeft' || event.key === 'ArrowUp' ? -1 : 1
        const selectedIndex = items.findIndex(({ id }) => id === selectedId)
        const nextIndex = selectedIndex < 0
          ? direction < 0 ? items.length - 1 : 0
          : Math.max(0, Math.min(items.length - 1, selectedIndex + direction))
        setSelectedId(items[nextIndex]?.id || null)
      }
      if (activeWindow === 'finder' && selectedItem && !targetIsText && (event.key === 'Enter' || event.metaKey && event.key.toLowerCase() === 'o')) {
        event.preventDefault()
        setQuickLookItem(selectedItem)
      }
      if (event.metaKey && event.key.toLowerCase() === 'c' && activeWindow === 'finder' && selectedItem && !targetIsText) {
        event.preventDefault()
        copyText(selectedItem.title).catch(() => {})
      }
      if (event.metaKey && event.key.toLowerCase() === 'f' && !activeApp) {
        if (event.ctrlKey) {
          event.preventDefault()
          openFinder()
          setFullscreen((value) => !value)
          return
        }
        event.preventDefault()
        openFinder()
        window.requestAnimationFrame(() => searchInputRef.current?.focus())
      }
      if (event.metaKey && event.ctrlKey && event.key.toLowerCase() === 'f' && activeApp) {
        event.preventDefault()
        toggleAppZoom(activeApp)
      }
      if (event.metaKey && event.key.toLowerCase() === 'w') {
        event.preventDefault()
        if (activeWindow === 'finder') closeFinder()
        else if (activeApp) closeApp(activeApp)
      }
      if (event.metaKey && event.key.toLowerCase() === 'm') {
        event.preventDefault()
        if (activeWindow === 'finder') minimizeFinder()
        else if (activeApp) minimizeApp(activeApp)
      }
      if (event.metaKey && event.key.toLowerCase() === 'n') {
        event.preventDefault()
        if (!activeApp) openFinder()
      }
      if (event.metaKey && !event.altKey && event.key.toLowerCase() === 'h') {
        event.preventDefault()
        if (activeApp) minimizeApp(activeApp)
        else minimizeFinder()
      }
      if (event.metaKey && event.key.toLowerCase() === 'q') {
        event.preventDefault()
        if (activeApp) closeApp(activeApp)
      }
      if (event.metaKey && event.key === ',') {
        event.preventDefault()
        openApp('settings')
      }
      if (event.metaKey && event.ctrlKey && event.key.toLowerCase() === 's' && !activeApp) { event.preventDefault(); setSidebarOpen((value) => !value) }
      if (event.metaKey && event.altKey && event.key.toLowerCase() === 'a' && !activeApp) { event.preventDefault(); setShowAll((value) => !value) }
      if (event.metaKey && !event.altKey && event.key === '1' && !activeApp) { event.preventDefault(); setViewMode('icons') }
      if (event.metaKey && !event.altKey && event.key === '2' && !activeApp) { event.preventDefault(); setViewMode('list') }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [activeApp, activeWindow, closeApp, closeFinder, cycleWindows, hideOtherWindows, minimizeApp, minimizeFinder, openApp, openFinder, section, selectedId, selectedItem, showAll, toggleAppZoom])

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

  const performEditAction = (action) => {
    const target = document.activeElement
    const targetIsText = target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target?.isContentEditable

    if (action === 'copy' && !targetIsText && selectedItem) {
      copyText(selectedItem.title).catch(() => {})
      return
    }
    if (action === 'selectAll' && typeof target?.select === 'function') {
      target.select()
      return
    }
    document.execCommand(action)
  }

  const handleMenuAction = (action) => {
    setActiveMenu(null)
    if (!action) return
    if (action.startsWith('focusWindow:')) focusWindow(action.split(':')[1])
    else if (['undo', 'redo', 'cut', 'copy', 'paste', 'selectAll'].includes(action)) performEditAction(action)
    else if (action === 'about') setAboutOpen(true)
    else if (action === 'settings') openApp('settings')
    else if (action === 'new') openFinder()
    else if (action === 'openSelected' || action === 'quicklookSelected') {
      if (selectedItem) setQuickLookItem(selectedItem)
    }
    else if (action === 'close') {
      if (activeWindow === 'finder') closeFinder()
      else if (activeApp) closeApp(activeApp)
    }
    else if (action === 'minimize' || action === 'hide') activeApp ? minimizeApp(activeApp) : minimizeFinder()
    else if (action === 'hideOthers') hideOtherWindows()
    else if (action === 'showAllWindows') showAllWindows()
    else if (action === 'quit' && activeApp) closeApp(activeApp)
    else if (action === 'zoom') {
      if (activeApp) toggleAppZoom(activeApp)
      else if (windowOpen) {
        openFinder()
        setFullscreen((value) => !value)
      }
    }
    else if (action === 'icons' || action === 'list') setViewMode(action)
    else if (action === 'toggleSidebar') setSidebarOpen((value) => !value)
    else if (action === 'archive') setShowAll((value) => !value)
    else if (action === 'focusSearch' && !activeApp) {
      openFinder()
      window.requestAnimationFrame(() => searchInputRef.current?.focus())
    }
    else if (SECTION_META.some((entry) => entry.id === action)) {
      openFinder()
      setSection(action)
      setSearch('')
    }
  }

  const handleContextAction = (action) => {
    const menu = contextMenu
    setContextMenu(null)
    if (!menu) return
    if (menu.type === 'dock-app') {
      if (action === 'dockOpen') {
        if (menu.app === 'finder') openFinder()
        else if (menu.app === 'terminal') selectStyle(STYLES.TERMINAL)
        else openApp(menu.app)
      }
      if (action === 'dockHide') {
        if (menu.app === 'finder') minimizeFinder()
        else minimizeApp(menu.app)
      }
      if (action === 'dockQuit' && menu.app !== 'finder' && menu.app !== 'terminal') closeApp(menu.app)
      return
    }
    if (menu.type === 'record') {
      if (action === 'open' || action === 'quicklook') setQuickLookItem(menu.item)
      if (action === 'link' && menu.item.link) window.open(menu.item.link, '_blank', 'noopener,noreferrer')
      if (action === 'copy') copyText(menu.item.title).catch(() => {})
      return
    }
    if (menu.type === 'section') {
      if (action === 'open') {
        openFinder()
        setSection(menu.item.id)
        setSelectedId(null)
      }
      if (action === 'info') setAboutOpen(true)
      return
    }
    if (action === 'open' || action === 'new') openFinder()
    if (action === 'settings') openApp('settings')
    if (action === 'info') setAboutOpen(true)
  }

  const appName = APP_NAMES[activeApp] || 'Finder'
  const menus = useMemo(() => buildMenus({
    activeApp,
    activeWindow,
    appName,
    editingText,
    fullscreen,
    minimized,
    minimizedApps,
    openApps,
    section,
    selectedItem,
    showAll,
    sidebarOpen,
    viewMode,
    windowOpen,
    zoomedApps
  }), [activeApp, activeWindow, appName, editingText, fullscreen, minimized, minimizedApps, openApps, section, selectedItem, showAll, sidebarOpen, viewMode, windowOpen, zoomedApps])

  return (
    <MotionConfig reducedMotion="user">
      <main className="macos-desktop" ref={desktopRef} onPointerDown={(event) => {
      setActiveMenu(null)
      setActiveWindow(null)
      setContextMenu(null)
      if (!event.target.closest('.macos-desktop-folder')) setDesktopIconSelected(false)
    }} onContextMenu={(event) => {
      if (!event.target.closest('.macos-finder-window,.macos-app-window,.macos-menu-bar,.macos-dock,.macos-desktop-folder')) showContextMenu(event, { type: 'desktop' })
    }} onFocusCapture={(event) => {
      setEditingText(Boolean(event.target.matches?.('input:not([readonly]):not([type="range"]), textarea, [contenteditable="true"]')))
    }} onBlurCapture={(event) => {
      setEditingText(Boolean(event.relatedTarget?.matches?.('input:not([readonly]):not([type="range"]), textarea, [contenteditable="true"]')))
    }}>
      <div
        className={`macos-wallpaper wallpaper-${wallpaper}`}
        style={{ '--wallpaper-scale': wallpaperScale / 100, '--wallpaper-vivid': wallpaperVivid / 100 }}
        aria-hidden="true"
      ><i /><i /><i /></div>
      <MenuBar activeMenu={activeMenu} setActiveMenu={setActiveMenu} onAction={handleMenuAction} menus={menus} />

      <Motion.button
        type="button"
        className={`macos-desktop-folder ${desktopIconSelected ? 'selected' : ''}`}
        drag={!isMobile}
        dragConstraints={desktopRef}
        dragMomentum={false}
        whileDrag={{ scale: 1.04, opacity: .9 }}
        onClick={() => setDesktopIconSelected(true)}
        onDoubleClick={openFinder}
        onContextMenu={(event) => showContextMenu(event, { type: 'desktop-icon' })}
      ><FolderIcon /><span>Portfolio</span></Motion.button>

      <AnimatePresence>
        {windowOpen && (
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
            onClose={closeFinder}
            onMinimize={minimizeFinder}
            minimized={minimized}
            fullscreen={fullscreen}
            onZoom={() => setFullscreen((value) => !value)}
            searchInputRef={searchInputRef}
            sidebarOpen={sidebarOpen}
            onToggleSidebar={() => setSidebarOpen((value) => !value)}
            active={activeWindow === 'finder'}
            onFocus={openFinder}
            onContextMenu={showContextMenu}
          />
        )}
        {quickLookItem && <QuickLook item={quickLookItem} onClose={() => setQuickLookItem(null)} />}
        {aboutOpen && <AboutDialog onClose={() => setAboutOpen(false)} />}
        {contextMenu && <ContextMenu menu={contextMenu} onAction={handleContextAction} onClose={() => setContextMenu(null)} />}
        {openApps.map((app) => {
          const windowProps = {
            desktopRef,
            isMobile,
            active: activeWindow === app,
            minimized: minimizedApps.includes(app),
            zoomed: zoomedApps.includes(app),
            onFocus: () => openApp(app),
            onClose: () => closeApp(app),
            onMinimize: () => minimizeApp(app),
            onZoom: () => toggleAppZoom(app)
          }
          if (app === 'safari') return <SafariWindow key={app} {...windowProps} />
          if (app === 'mail') return <MailWindow key={app} {...windowProps} />
          if (app === 'calculator') return <CalculatorWindow key={app} {...windowProps} />
          if (app === 'notes') return <NotesWindow key={app} {...windowProps} />
          if (app === 'settings') return (
            <SettingsWindow
              key={app}
              {...windowProps}
              wallpaper={wallpaper}
              setWallpaper={setWallpaper}
              scale={wallpaperScale}
              setScale={setWallpaperScale}
              vivid={wallpaperVivid}
              setVivid={setWallpaperVivid}
            />
          )
          return null
        })}
      </AnimatePresence>

      <Dock
        activeWindow={activeWindow}
        windowOpen={windowOpen}
        minimized={minimized}
        openApps={openApps}
        minimizedApps={minimizedApps}
        onFinder={openFinder}
        onTerminal={() => selectStyle(STYLES.TERMINAL)}
        onApp={openApp}
        onContextMenu={showContextMenu}
      />
      <StyleSwitcher />
      </main>
    </MotionConfig>
  )
}
