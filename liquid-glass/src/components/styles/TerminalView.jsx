import { useEffect, useMemo, useRef, useState } from 'react'
import StyleSwitcher from '../StyleSwitcher'
import { getSectionItems, profile, SECTION_META } from '../../lib/profileData'
import './TerminalView.css'

const COMMANDS = [
  ['help', 'command index'],
  ['about', 'profile summary'],
  ['education', 'education history'],
  ['experience', 'work timeline'],
  ['projects', 'selected work'],
  ['awards', 'awards and competitions'],
  ['scholarships', 'scholarships and honors'],
  ['media', 'press and appearances'],
  ['activities', 'leadership and communities'],
  ['skills', 'technical inventory'],
  ['contact', 'public channels'],
  ['all', 'render every section'],
  ['archive', 'toggle hidden records'],
  ['clear', 'clear this session']
]

const COMMAND_NAMES = COMMANDS.map(([name]) => name)

function LinkIcon() {
  return <span aria-hidden="true">↗</span>
}

function SectionOutput({ section, showAll, compact = false }) {
  const meta = SECTION_META.find((entry) => entry.id === section)
  const items = getSectionItems(section, showAll)

  return (
    <section className={`terminal-result ${compact ? 'compact' : ''}`}>
      <header>
        <span>{meta?.symbol}</span>
        <h3>{meta?.label}</h3>
        <small>{String(items.length).padStart(2, '0')} records</small>
      </header>
      <div className="terminal-result-list">
        {items.map((item) => (
          <article key={item.id}>
            <div className="terminal-result-meta">
              <time>{item.period || '—'}</time>
              {item.category && <span>{item.category}</span>}
            </div>
            <div className="terminal-result-copy">
              <h4>
                {item.link ? (
                  <a href={item.link} target="_blank" rel="noopener noreferrer">
                    {item.title} <LinkIcon />
                  </a>
                ) : item.title}
              </h4>
              {item.subtitle && <p className="terminal-result-subtitle">{item.subtitle}</p>}
              {!compact && item.description && <p>{item.description}</p>}
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

function Output({ entry }) {
  if (entry.kind === 'welcome') {
    return (
      <div className="terminal-welcome">
        <div className="terminal-ascii" aria-hidden="true">
          <span>╭──────────────╮</span>
          <span>│ TAEHO / 2026 │</span>
          <span>╰──────────────╯</span>
        </div>
        <div>
          <p className="terminal-kicker">Interactive portfolio shell</p>
          <h2>{profile.name}</h2>
          <p>{profile.title}</p>
          <small>Type <strong>help</strong> or choose a command from the sidebar.</small>
        </div>
      </div>
    )
  }

  if (entry.kind === 'command') {
    return (
      <div className="terminal-command-line">
        <span className="terminal-path">taeho@portfolio</span>
        <span className="terminal-chevron">❯</span>
        <span>{entry.command}</span>
      </div>
    )
  }

  if (entry.kind === 'help') {
    return (
      <div className="terminal-help-grid">
        {COMMANDS.map(([name, description]) => (
          <div key={name}><code>{name}</code><span>{description}</span></div>
        ))}
      </div>
    )
  }

  if (entry.kind === 'about') {
    return (
      <div className="terminal-about">
        <p>{profile.about}</p>
        <dl>
          <div><dt>role</dt><dd>{profile.title}</dd></div>
          <div><dt>location</dt><dd>{profile.location}</dd></div>
          <div><dt>status</dt><dd><span className="terminal-online-dot" /> building useful systems</dd></div>
        </dl>
      </div>
    )
  }

  if (entry.kind === 'section') return <SectionOutput section={entry.section} showAll={entry.showAll} />

  if (entry.kind === 'all') {
    return (
      <div className="terminal-all-sections">
        {SECTION_META.map(({ id }) => <SectionOutput key={id} section={id} showAll={entry.showAll} compact />)}
      </div>
    )
  }

  if (entry.kind === 'skills') {
    return (
      <div className="terminal-skills">
        {profile.skills.map((skill) => (
          <div key={skill.name}>
            <span>{skill.name}</span>
            <span className="terminal-skill-track"><i style={{ width: `${skill.level}%` }} /></span>
            <small>{skill.level}</small>
          </div>
        ))}
      </div>
    )
  }

  if (entry.kind === 'contact') {
    return (
      <div className="terminal-contact">
        <a href={`mailto:${profile.email}`}><span>email</span>{profile.email}<LinkIcon /></a>
        <a href={profile.github} target="_blank" rel="noopener noreferrer"><span>github</span>{profile.github}<LinkIcon /></a>
        <a href={profile.linkedin} target="_blank" rel="noopener noreferrer"><span>linkedin</span>{profile.linkedin}<LinkIcon /></a>
      </div>
    )
  }

  return <p className={entry.kind === 'error' ? 'terminal-error' : 'terminal-notice'}>{entry.text}</p>
}

export default function TerminalView() {
  const [entries, setEntries] = useState([{ id: 1, kind: 'welcome' }])
  const [input, setInput] = useState('')
  const [showAll, setShowAll] = useState(false)
  const [commandHistory, setCommandHistory] = useState([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const inputRef = useRef(null)
  const consoleRef = useRef(null)
  const idRef = useRef(2)

  const suggestions = useMemo(() => {
    const query = input.trim().replace(/^\//, '').toLowerCase()
    if (!query) return []
    return COMMANDS.filter(([name]) => name.startsWith(query)).slice(0, 5)
  }, [input])

  useEffect(() => {
    consoleRef.current?.scrollTo({ top: consoleRef.current.scrollHeight, behavior: 'smooth' })
  }, [entries])

  const append = (...newEntries) => {
    setEntries((current) => [
      ...current,
      ...newEntries.map((entry) => ({ id: idRef.current++, ...entry }))
    ])
  }

  const runCommand = (rawCommand) => {
    const command = rawCommand.trim().replace(/^\//, '').toLowerCase()
    if (!command) return

    setCommandHistory((current) => [...current, command])
    setHistoryIndex(-1)

    if (command === 'clear') {
      setEntries([{ id: idRef.current++, kind: 'notice', text: 'Session cleared. Type help to restore the command index.' }])
      setInput('')
      return
    }

    if (command === 'archive') {
      const next = !showAll
      setShowAll(next)
      append(
        { kind: 'command', command },
        { kind: 'notice', text: next ? 'Full archive mounted. Hidden records are available in every section.' : 'Returned to the curated public profile.' }
      )
      setInput('')
      return
    }

    const section = SECTION_META.find(({ id }) => id === command)
    const output = section
      ? { kind: 'section', section: section.id, showAll }
      : command === 'help'
        ? { kind: 'help' }
        : command === 'about' || command === 'whoami'
          ? { kind: 'about' }
          : command === 'skills'
            ? { kind: 'skills' }
            : command === 'contact'
              ? { kind: 'contact' }
              : command === 'all'
                ? { kind: 'all', showAll }
                : { kind: 'error', text: `zsh: command not found: ${command}. Try help.` }

    append({ kind: 'command', command }, output)
    setInput('')
  }

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault()
      runCommand(input)
      return
    }

    if (event.key === 'Tab' && suggestions.length) {
      event.preventDefault()
      setInput(suggestions[0][0])
      return
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault()
      const nextIndex = Math.min(historyIndex + 1, commandHistory.length - 1)
      setHistoryIndex(nextIndex)
      setInput(commandHistory[commandHistory.length - 1 - nextIndex] || '')
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault()
      const nextIndex = Math.max(historyIndex - 1, -1)
      setHistoryIndex(nextIndex)
      setInput(nextIndex === -1 ? '' : commandHistory[commandHistory.length - 1 - nextIndex] || '')
    }
  }

  return (
    <main className="terminal-pro-view" onPointerDown={() => inputRef.current?.focus()}>
      <div className="terminal-ambient" aria-hidden="true" />
      <section className="terminal-pro-window">
        <header className="terminal-pro-titlebar">
          <div className="terminal-traffic"><i /><i /><i /></div>
          <div className="terminal-tab active"><span>⌘</span> taeho@portfolio:~</div>
          <button aria-label="New terminal tab">＋</button>
          <div className="terminal-titlebar-status"><span /> local</div>
        </header>

        <div className="terminal-pro-layout">
          <aside className="terminal-sidecar">
            <div className="terminal-identity">
              <span className="terminal-avatar">TJ</span>
              <div><strong>{profile.name}</strong><small>{profile.title}</small></div>
            </div>

            <nav aria-label="Terminal shortcuts">
              <span className="terminal-nav-label">Commands</span>
              {SECTION_META.map((section) => (
                <button key={section.id} onClick={() => runCommand(section.id)}>
                  <span>{section.symbol}</span>{section.label}
                  <small>{profile.sectionCounts[section.id][showAll ? 'total' : 'featured']}</small>
                </button>
              ))}
              <button onClick={() => runCommand('skills')}><span>08</span>Skills<small>{profile.skills.length}</small></button>
            </nav>

            <button className={`terminal-archive-toggle ${showAll ? 'active' : ''}`} onClick={() => runCommand('archive')}>
              <span>{showAll ? 'Archive mounted' : 'Curated profile'}</span>
              <i />
            </button>
          </aside>

          <div className="terminal-console" ref={consoleRef}>
            <div className="terminal-console-inner">
              {entries.map((entry) => <Output key={entry.id} entry={entry} />)}

              <div className="terminal-live-prompt">
                <span className="terminal-path">taeho@portfolio</span>
                <span className="terminal-chevron">❯</span>
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  onKeyDown={handleKeyDown}
                  aria-label="Terminal command"
                  autoComplete="off"
                  autoCapitalize="off"
                  spellCheck={false}
                />
              </div>

              {suggestions.length > 0 && (
                <div className="terminal-suggestions">
                  {suggestions.map(([name, description]) => (
                    <button key={name} onClick={() => runCommand(name)}>
                      <code>{name}</code><span>{description}</span><kbd>↵</kbd>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <footer className="terminal-statusbar">
          <span>zsh</span><span>UTF-8</span><span>{showAll ? 'archive:full' : 'archive:featured'}</span><span className="terminal-status-right">portfolio.json · ready</span>
        </footer>
      </section>
      <StyleSwitcher />
    </main>
  )
}
