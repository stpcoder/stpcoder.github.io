import { useEffect, useMemo, useRef, useState } from 'react'
import StyleSwitcher from '../StyleSwitcher'
import { getSectionItems, profile, SECTION_META } from '../../lib/profileData'
import './TerminalView.css'

const ROOT_PATH = '/Users/taeho/portfolio'
const CORE_COMMANDS = ['help', 'ls', 'cd', 'pwd', 'cat', 'open', 'tree', 'whoami', 'portfolio', 'archive', 'history', 'date', 'echo', 'clear']
const SECTION_IDS = SECTION_META.map(({ id }) => id)

function pathLabel(cwd) {
  return cwd ? `~/${cwd}` : '~'
}

function tokenize(value) {
  return value.match(/(?:[^\s"]+|"[^"]*")+/g)?.map((part) => part.replace(/^"|"$/g, '')) || []
}

function Prompt({ cwd, command }) {
  return (
    <div className="shell-prompt-line">
      <span className="shell-user">taeho@portfolio</span>
      <span className="shell-path">{pathLabel(cwd)}</span>
      <span className="shell-symbol">%</span>
      <span className="shell-command">{command}</span>
    </div>
  )
}

function DirectoryListing({ showAll }) {
  return (
    <div className="shell-directory-grid">
      {SECTION_META.map((section) => (
        <div key={section.id}>
          <span className="shell-directory">{section.id}/</span>
          <span>{profile.sectionCounts[section.id][showAll ? 'total' : 'featured']} items</span>
        </div>
      ))}
      <div><span className="shell-file">about.txt</span><span>profile</span></div>
      <div><span className="shell-file">contact.vcf</span><span>public links</span></div>
    </div>
  )
}

function RecordListing({ section, showAll }) {
  const items = getSectionItems(section, showAll)

  return (
    <div className="shell-record-list">
      {items.map((item, index) => (
        <div key={item.id}>
          <span className="shell-record-index">{String(index + 1).padStart(2, '0')}</span>
          <span className="shell-record-title">{item.title}</span>
          <span className="shell-record-period">{item.period || '-'}</span>
        </div>
      ))}
    </div>
  )
}

function RecordDetail({ item, index }) {
  if (!item) return <p className="shell-error">cat: record not found</p>

  return (
    <article className="shell-record-detail">
      <header><span>{String(index + 1).padStart(2, '0')}</span><time>{item.period || 'Undated'}</time></header>
      <h2>{item.title}</h2>
      {item.subtitle && <h3>{item.subtitle}</h3>}
      {item.description && <p>{item.description}</p>}
      {item.link && <a href={item.link} target="_blank" rel="noopener noreferrer">Open source link -&gt;</a>}
    </article>
  )
}

function Output({ entry }) {
  if (entry.kind === 'prompt') return <Prompt cwd={entry.cwd} command={entry.command} />

  if (entry.kind === 'welcome') {
    return (
      <div className="shell-welcome">
        <p>Last login: {entry.loginAt} on ttys001</p>
        <strong>{profile.name}</strong>
        <span>{profile.title}</span>
        <small>Type <b>help</b> to see commands, or <b>ls</b> to browse the portfolio.</small>
      </div>
    )
  }

  if (entry.kind === 'help') {
    return (
      <div className="shell-help">
        <div><code>ls [path]</code><span>list sections or records</span></div>
        <div><code>cd [section]</code><span>move into a portfolio section</span></div>
        <div><code>cat [number]</code><span>read a record in the current section</span></div>
        <div><code>open [number]</code><span>open a record link</span></div>
        <div><code>tree</code><span>show the portfolio structure</span></div>
        <div><code>whoami</code><span>show profile details</span></div>
        <div><code>archive on|off</code><span>include or hide archived records</span></div>
        <div><code>history / clear</code><span>manage this terminal session</span></div>
      </div>
    )
  }

  if (entry.kind === 'root-list') return <DirectoryListing showAll={entry.showAll} />
  if (entry.kind === 'records') return <RecordListing section={entry.section} showAll={entry.showAll} />
  if (entry.kind === 'record') return <RecordDetail item={entry.item} index={entry.index} />

  if (entry.kind === 'about') {
    return (
      <div className="shell-about">
        <p>{profile.about}</p>
        <dl>
          <div><dt>role</dt><dd>{profile.title}</dd></div>
          <div><dt>location</dt><dd>{profile.location}</dd></div>
          <div><dt>email</dt><dd><a href={`mailto:${profile.email}`}>{profile.email}</a></dd></div>
        </dl>
      </div>
    )
  }

  if (entry.kind === 'tree') {
    return (
      <pre className="shell-tree">{entry.lines.join('\n')}</pre>
    )
  }

  if (entry.kind === 'history') {
    return <div className="shell-history">{entry.commands.map((command, index) => <p key={`${command}-${index}`}><span>{index + 1}</span>{command}</p>)}</div>
  }

  if (entry.kind === 'links') {
    return (
      <div className="shell-links">
        <a href={profile.github} target="_blank" rel="noopener noreferrer">github   {profile.github}</a>
        <a href={profile.linkedin} target="_blank" rel="noopener noreferrer">linkedin {profile.linkedin}</a>
        <a href={`mailto:${profile.email}`}>email    {profile.email}</a>
      </div>
    )
  }

  return <p className={`shell-message ${entry.kind === 'error' ? 'error' : ''}`}>{entry.text}</p>
}

export default function TerminalView() {
  const loginAt = useMemo(() => new Intl.DateTimeFormat('en-US', {
    month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false
  }).format(new Date()), [])
  const [entries, setEntries] = useState([{ id: 1, kind: 'welcome', loginAt }])
  const [input, setInput] = useState('')
  const [cwd, setCwd] = useState('')
  const [showAll, setShowAll] = useState(false)
  const [history, setHistory] = useState([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const inputRef = useRef(null)
  const scrollRef = useRef(null)
  const entryIdRef = useRef(2)

  const append = (...items) => {
    setEntries((current) => [...current, ...items.map((item) => ({ ...item, id: entryIdRef.current++ }))])
  }

  const completions = useMemo(() => {
    const parts = input.trimStart().split(/\s+/)
    const query = parts.at(-1)?.toLowerCase() || ''
    const pool = parts.length > 1
      ? [...SECTION_IDS, '..', '~', '/', 'about.txt', 'contact.vcf', 'on', 'off']
      : [...CORE_COMMANDS, ...SECTION_IDS]
    return pool.filter((value) => value.startsWith(query))
  }, [input])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [entries])

  useEffect(() => {
    const focusTerminal = (event) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLButtonElement || event.target instanceof HTMLAnchorElement) return
      inputRef.current?.focus()
    }
    window.addEventListener('keydown', focusTerminal)
    return () => window.removeEventListener('keydown', focusTerminal)
  }, [])

  const resolveSection = (value) => {
    if (!value || value === '.' || value === '~' || value === '/' || value === ROOT_PATH) return ''
    if (value === '..') return ''
    const normalized = value.replace(/^~?\/?/, '').replace(/\/$/, '').toLowerCase()
    return SECTION_IDS.includes(normalized) ? normalized : null
  }

  const listRecords = (section, archiveState = showAll) => append({ kind: 'records', section, showAll: archiveState })

  const runCommand = (rawValue) => {
    const raw = rawValue.trim()
    if (!raw) return

    const [commandToken = '', ...args] = tokenize(raw)
    const command = commandToken.toLowerCase()
    const promptEntry = { kind: 'prompt', cwd, command: raw }
    const nextHistory = [...history, raw]
    setHistory(nextHistory)
    setHistoryIndex(-1)
    setInput('')

    if (command === 'clear') {
      setEntries([])
      return
    }

    append(promptEntry)

    if (SECTION_IDS.includes(command)) {
      setCwd(command)
      listRecords(command)
      return
    }

    switch (command) {
      case 'help':
        append({ kind: 'help' })
        break
      case 'pwd':
        append({ kind: 'message', text: cwd ? `${ROOT_PATH}/${cwd}` : ROOT_PATH })
        break
      case 'ls': {
        const target = args[0] ? resolveSection(args[0]) : cwd
        if (target === null) append({ kind: 'error', text: `ls: ${args[0]}: No such file or directory` })
        else if (target) listRecords(target)
        else append({ kind: 'root-list', showAll })
        break
      }
      case 'cd': {
        const target = resolveSection(args[0] || '~')
        if (target === null) append({ kind: 'error', text: `cd: no such file or directory: ${args[0]}` })
        else setCwd(target)
        break
      }
      case 'cat': {
        const target = (args[0] || '').toLowerCase()
        if ((!cwd && target === 'about.txt') || target === 'about') append({ kind: 'about' })
        else if ((!cwd && target === 'contact.vcf') || target === 'contact') append({ kind: 'links' })
        else if (cwd && /^\d+$/.test(target)) {
          const index = Number(target) - 1
          append({ kind: 'record', item: getSectionItems(cwd, showAll)[index], index })
        } else append({ kind: 'error', text: `cat: ${args[0] || ''}: No such file` })
        break
      }
      case 'open': {
        const target = (args[0] || '').toLowerCase()
        const publicLinks = { github: profile.github, linkedin: profile.linkedin, email: `mailto:${profile.email}` }
        if (publicLinks[target]) window.open(publicLinks[target], target === 'email' ? '_self' : '_blank', 'noopener,noreferrer')
        else if (cwd && /^\d+$/.test(target)) {
          const item = getSectionItems(cwd, showAll)[Number(target) - 1]
          if (item?.link) window.open(item.link, '_blank', 'noopener,noreferrer')
          else append({ kind: 'error', text: `open: record ${target} has no public link` })
        } else append({ kind: 'error', text: 'open: use a record number, github, linkedin, or email' })
        break
      }
      case 'tree': {
        const lines = ['portfolio/']
        SECTION_META.forEach((section, index) => {
          const tail = index === SECTION_META.length - 1 ? '`--' : '|--'
          lines.push(`${tail} ${section.id}/ (${profile.sectionCounts[section.id][showAll ? 'total' : 'featured']})`)
        })
        append({ kind: 'tree', lines })
        break
      }
      case 'whoami':
      case 'portfolio':
        append({ kind: 'about' })
        break
      case 'archive': {
        const requested = args[0]?.toLowerCase()
        const next = requested === 'on' ? true : requested === 'off' ? false : !showAll
        setShowAll(next)
        append({ kind: 'message', text: next ? 'Archive records are now included.' : 'Showing featured records only.' })
        break
      }
      case 'history':
        append({ kind: 'history', commands: nextHistory })
        break
      case 'date':
        append({ kind: 'message', text: new Date().toString() })
        break
      case 'echo':
        append({ kind: 'message', text: args.join(' ') })
        break
      default:
        append({ kind: 'error', text: `zsh: command not found: ${command}. Type help.` })
    }
  }

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault()
      runCommand(input)
      return
    }
    if (event.key === 'Tab' && completions.length) {
      event.preventDefault()
      const parts = input.split(/\s+/)
      parts[parts.length - 1] = completions[0]
      setInput(parts.join(' '))
      return
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault()
      const next = Math.min(historyIndex + 1, history.length - 1)
      setHistoryIndex(next)
      setInput(history[history.length - 1 - next] || '')
      return
    }
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      const next = Math.max(historyIndex - 1, -1)
      setHistoryIndex(next)
      setInput(next === -1 ? '' : history[history.length - 1 - next] || '')
      return
    }
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'l') {
      event.preventDefault()
      setEntries([])
    }
  }

  return (
    <main className="shell-view" onPointerDown={() => inputRef.current?.focus()}>
      <div className="shell-wallpaper" aria-hidden="true" />
      <section className="shell-window">
        <header className="shell-titlebar">
          <div className="shell-traffic" aria-hidden="true"><i /><i /><i /></div>
          <div className="shell-window-title"><span>Terminal</span><small>{pathLabel(cwd)} - zsh</small></div>
          <span aria-hidden="true" />
        </header>

        <div className="shell-screen" ref={scrollRef}>
          {entries.map((entry) => <Output key={entry.id} entry={entry} />)}
          <div className="shell-live-line">
            <span className="shell-user">taeho@portfolio</span>
            <span className="shell-path">{pathLabel(cwd)}</span>
            <span className="shell-symbol">%</span>
            <input
              ref={inputRef}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={handleKeyDown}
              aria-label="Terminal command"
              autoFocus
              autoComplete="off"
              autoCapitalize="off"
              spellCheck={false}
            />
          </div>
        </div>

        <footer className="shell-touchbar">
          {['help', 'ls', 'whoami', 'tree'].map((command) => <button type="button" key={command} onClick={() => runCommand(command)}>{command}</button>)}
          <span>{showAll ? 'archive on' : 'featured only'}</span>
        </footer>
      </section>
      <StyleSwitcher />
    </main>
  )
}
