import { useEffect, useMemo, useRef, useState } from 'react'
import StyleSwitcher from '../StyleSwitcher'
import ViEditor from '../terminal/ViEditor'
import { getAllItems, getSectionItems, profile, SECTION_META } from '../../lib/profileData'
import {
  expandShellAlias,
  normalizeShellPath,
  SHELL_HOME,
  shellBasename,
  shellDirname,
  shellDisplayPath,
  splitPipeline,
  SYSTEM_DIRECTORIES,
  tokenizeShell
} from '../../lib/portfolioShell'
import { COMMAND_GROUPS, CORE_COMMANDS, getCommandManual } from '../../lib/terminalCommandCatalog'
import './TerminalView.css'

const SECTION_IDS = SECTION_META.map(({ id }) => id)
const BUILTIN_COMMANDS = new Set([...CORE_COMMANDS, ...SECTION_IDS, 'la', 'll', 'whoami'])
const SHELL_BUILTINS = new Set(['alias', 'cd', 'command', 'echo', 'exit', 'export', 'help', 'history', 'jobs', 'kill', 'printf', 'pwd', 'source', 'type', 'unset'])
const STATIC_FILES = {
  '/etc/hostname': 'portfolio',
  '/etc/shells': '/bin/sh\n/bin/bash\n/bin/zsh',
  '/System/Library/CoreServices/SystemVersion.plist': '<?xml version="1.0"?>\n<plist><dict><key>ProductName</key><string>macOS</string><key>ProductVersion</key><string>15.5</string></dict></plist>',
  [`${SHELL_HOME}/.profile`]: 'export PATH=/usr/local/bin:/usr/bin:/bin\nexport LANG=en_US.UTF-8',
  [`${SHELL_HOME}/.zshrc`]: "alias ll='ls -la'\nalias la='ls -a'",
  [`${SHELL_HOME}/about.txt`]: () => `${profile.name}\n${profile.title}\n${profile.location}\n\n${profile.about}`,
  [`${SHELL_HOME}/contact.vcf`]: () => `EMAIL:${profile.email}\nGITHUB:${profile.github}\nLINKEDIN:${profile.linkedin}`
}

function writeClipboard(value) {
  if (!navigator.clipboard?.writeText) return Promise.reject(new Error('Clipboard unavailable'))
  return navigator.clipboard.writeText(value)
}

function sectionFromPath(path) {
  if (shellDirname(path) !== SHELL_HOME) return ''
  const name = shellBasename(path)
  return SECTION_IDS.includes(name) ? name : ''
}

function recordText(item, index) {
  if (!item) return ''
  return [
    `# ${String(index + 1).padStart(2, '0')} ${item.title}`,
    item.subtitle,
    item.period,
    item.category,
    '',
    item.description,
    item.link ? `\n${item.link}` : ''
  ].filter(Boolean).join('\n')
}

function recordFileName(item, index) {
  const slug = item.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 32) || 'record'
  return `${String(index + 1).padStart(2, '0')}-${slug}.md`
}

function expandVariables(value, environment, cwd) {
  return value.replace(/\$\{?([A-Za-z_][A-Za-z0-9_]*)\}?/g, (_, key) => {
    if (key === 'PWD') return cwd
    return environment[key] ?? ''
  })
}

function Prompt({ cwd, command }) {
  return (
    <div className="shell-prompt-line">
      <span className="shell-user">taeho@portfolio</span>
      <span className="shell-path">{shellDisplayPath(cwd)}</span>
      <span className="shell-symbol">%</span>
      <span className="shell-command">{command}</span>
    </div>
  )
}

function HomeListing({ showAll, long = false, hidden = false }) {
  if (long) {
    const lines = [`total ${hidden ? 13 : 9}`]
    if (hidden) lines.push('drwxr-xr-x   1 taeho  staff  ./', 'drwxr-xr-x   1 root   root   ../')
    SECTION_META.forEach((section) => lines.push(`drwxr-xr-x  ${String(profile.sectionCounts[section.id][showAll ? 'total' : 'featured']).padStart(2)} taeho  staff  ${section.id}/`))
    lines.push('-rw-r--r--   1 taeho  staff  about.txt', '-rw-r--r--   1 taeho  staff  contact.vcf')
    if (hidden) lines.push('-rw-r--r--   1 taeho  staff  .profile', '-rw-r--r--   1 taeho  staff  .zshrc')
    return <pre className="shell-tree">{lines.join('\n')}</pre>
  }

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
      {hidden ? <div><span className="shell-file">.profile</span><span>environment</span></div> : null}
      {hidden ? <div><span className="shell-file">.zshrc</span><span>shell aliases</span></div> : null}
    </div>
  )
}

function RecordListing({ section, showAll, long = false }) {
  const items = getSectionItems(section, showAll)
  return (
    <div className={`shell-record-list ${long ? 'long' : ''}`}>
      {items.map((item, index) => (
        <div key={item.id}>
          <span className="shell-record-index">{long ? '-rw-r--r--' : String(index + 1).padStart(2, '0')}</span>
          <span className="shell-record-title">{long ? recordFileName(item, index) : item.title}</span>
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
        <small>Type <b>help</b> to list supported commands.</small>
      </div>
    )
  }
  if (entry.kind === 'help') {
    return (
      <div className="shell-help">
        {COMMAND_GROUPS.map((group) => <section key={group.label}><strong>{group.label}</strong><code>{group.commands.join('  ')}</code></section>)}
        <p><code>help command</code> or <code>man command</code> prints usage. Tab completes commands and paths.</p>
      </div>
    )
  }
  if (entry.kind === 'manual') {
    return (
      <pre className="shell-manual"><strong>{entry.manual.command.toUpperCase()}(1)</strong>{`\n\nNAME\n    ${entry.manual.command} - ${entry.manual.description}\n\nSYNOPSIS\n    ${entry.manual.synopsis}`}</pre>
    )
  }
  if (entry.kind === 'home-list') return <HomeListing showAll={entry.showAll} long={entry.long} hidden={entry.hidden} />
  if (entry.kind === 'records') return <RecordListing section={entry.section} showAll={entry.showAll} long={entry.long} />
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
  if (entry.kind === 'history') return <div className="shell-history">{entry.commands.map((command, index) => <p key={`${command}-${index}`}><span>{index + 1}</span>{command}</p>)}</div>
  if (entry.kind === 'links') {
    return (
      <div className="shell-links">
        <a href={profile.github} target="_blank" rel="noopener noreferrer">github   {profile.github}</a>
        <a href={profile.linkedin} target="_blank" rel="noopener noreferrer">linkedin {profile.linkedin}</a>
        <a href={`mailto:${profile.email}`}>email    {profile.email}</a>
      </div>
    )
  }
  return <pre className={`shell-message ${entry.kind === 'error' ? 'error' : ''}`}>{entry.text}</pre>
}

export default function TerminalView() {
  const loginAt = useMemo(() => new Intl.DateTimeFormat('en-US', { month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date()), [])
  const [entries, setEntries] = useState([{ id: 1, kind: 'welcome', loginAt }])
  const [input, setInput] = useState('')
  const [cwd, setCwd] = useState(SHELL_HOME)
  const [previousCwd, setPreviousCwd] = useState(SHELL_HOME)
  const [showAll, setShowAll] = useState(false)
  const [history, setHistory] = useState([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [virtualDirectories, setVirtualDirectories] = useState([])
  const [virtualFiles, setVirtualFiles] = useState({})
  const [editor, setEditor] = useState(null)
  const [environment, setEnvironment] = useState({ USER: 'taeho', HOME: SHELL_HOME, SHELL: '/bin/zsh', TERM: 'xterm-256color', LANG: 'en_US.UTF-8' })
  const inputRef = useRef(null)
  const scrollRef = useRef(null)
  const entryIdRef = useRef(2)

  const allDirectories = useMemo(() => new Set([
    ...SYSTEM_DIRECTORIES,
    ...SECTION_IDS.map((id) => `${SHELL_HOME}/${id}`),
    ...virtualDirectories
  ]), [virtualDirectories])

  const append = (...items) => setEntries((current) => [...current, ...items.map((item) => ({ ...item, id: entryIdRef.current++ }))])
  const isDirectory = (path) => allDirectories.has(path)
  const currentSection = sectionFromPath(cwd)

  const staticFileContent = (path) => {
    const value = STATIC_FILES[path]
    return typeof value === 'function' ? value() : value
  }

  const resolveRecord = (pathValue, base = cwd) => {
    const path = normalizeShellPath(pathValue, base)
    const section = sectionFromPath(shellDirname(path))
    if (!section) return null
    const token = shellBasename(path)
    const match = token.match(/^(\d+)/)
    if (!match) return null
    const index = Number(match[1]) - 1
    const item = getSectionItems(section, showAll)[index]
    return item ? { item, index, section, path } : null
  }

  const readFile = (pathValue, base = cwd) => {
    const path = normalizeShellPath(pathValue, base)
    if (path in virtualFiles) return { path, text: virtualFiles[path] }
    const staticText = staticFileContent(path)
    if (staticText !== undefined) return { path, text: staticText }
    const record = resolveRecord(pathValue, base)
    if (record) return { path, text: recordText(record.item, record.index), record }
    return null
  }

  const immediateVirtualChildren = (directory) => {
    const prefix = directory === '/' ? '/' : `${directory}/`
    const children = new Set()
    ;[...virtualDirectories, ...Object.keys(virtualFiles)].forEach((path) => {
      if (!path.startsWith(prefix)) return
      const rest = path.slice(prefix.length)
      if (rest && !rest.includes('/')) children.add(`${rest}${virtualDirectories.includes(path) ? '/' : ''}`)
    })
    return [...children].sort()
  }

  const systemListing = (path) => {
    const listings = {
      '/': ['Applications/', 'Library/', 'System/', 'Users/', 'bin/', 'etc/', 'private/', 'tmp/', 'usr/', 'var/'],
      '/Applications': [],
      '/Library': [],
      '/System': ['Library/'],
      '/System/Library': ['CoreServices/'],
      '/System/Library/CoreServices': ['SystemVersion.plist'],
      '/Users': ['taeho/'],
      '/bin': [...CORE_COMMANDS].sort(),
      '/usr': ['bin/'],
      '/usr/bin': [...CORE_COMMANDS].sort(),
      '/etc': ['hostname', 'shells'],
      '/private': ['tmp/'],
      '/private/tmp': [],
      '/tmp': [],
      '/var': []
    }
    return [...(listings[path] || []), ...immediateVirtualChildren(path)]
  }

  const pathTextListing = (path, long = false, hidden = false) => {
    if (path === SHELL_HOME) {
      const names = [
        ...(hidden ? ['./', '../', '.profile', '.zshrc'] : []),
        ...SECTION_IDS.map((id) => `${id}/`),
        'about.txt',
        'contact.vcf',
        ...immediateVirtualChildren(path)
      ]
      return long ? names.map((name) => `${name.endsWith('/') ? 'd' : '-'}rwxr-xr-x  taeho  staff  ${name}`).join('\n') : names.join('\n')
    }
    const section = sectionFromPath(path)
    if (section) {
      return getSectionItems(section, showAll).map((item, index) => long
        ? `-rw-r--r--  taeho  staff  ${recordFileName(item, index)}`
        : recordFileName(item, index)).join('\n')
    }
    return systemListing(path).map((name) => long ? `${name.endsWith('/') ? 'd' : '-'}rwxr-xr-x  root   wheel  ${name}` : name).join('\n')
  }

  const findPaths = () => {
    const paths = []
    SECTION_IDS.forEach((section) => getSectionItems(section, showAll).forEach((item, index) => paths.push(`${SHELL_HOME}/${section}/${recordFileName(item, index)}`)))
    return [...paths, ...Object.keys(STATIC_FILES), ...Object.keys(virtualFiles), ...virtualDirectories].sort()
  }

  const evaluateTextCommand = (source, stdin = '') => {
    const [rawCommand = '', ...rawArgs] = tokenizeShell(source)
    const command = rawCommand.toLowerCase()
    const args = rawArgs.map((arg) => expandVariables(arg, environment, cwd))

    if (command === 'echo' || command === 'printf') return { text: args.join(' ').replace(/\\n/g, '\n') }
    if (command === 'pwd') return { text: cwd }
    if (command === 'whoami') return { text: environment.USER }
    if (command === 'hostname') return { text: 'portfolio' }
    if (command === 'date') return { text: new Date().toString() }
    if (command === 'env' || command === 'printenv') return { text: Object.entries({ ...environment, PWD: cwd }).map(([key, value]) => `${key}=${value}`).join('\n') }
    if (command === 'ls') {
      const flags = args.filter((arg) => arg.startsWith('-')).join('')
      const targetArg = args.find((arg) => !arg.startsWith('-')) || '.'
      const path = normalizeShellPath(targetArg, cwd)
      const file = readFile(targetArg)
      if (!isDirectory(path) && file) return { text: flags.includes('l') ? `-rw-r--r--  taeho  staff  ${shellBasename(file.path)}` : shellBasename(file.path) }
      if (!isDirectory(path)) return { error: `ls: ${targetArg}: No such file or directory` }
      return { text: pathTextListing(path, flags.includes('l'), flags.includes('a')) }
    }
    if (command === 'cat') {
      if (!args.length && stdin) return { text: stdin }
      const contents = []
      for (const target of args.filter((arg) => !arg.startsWith('-'))) {
        const file = readFile(target)
        if (!file) return { error: `cat: ${target}: No such file or directory` }
        contents.push(file.text)
      }
      return { text: contents.join('\n') }
    }
    if (command === 'find') {
      const nameIndex = args.findIndex((arg) => arg === '-name')
      const baseArg = args.find((arg, index) => !arg.startsWith('-') && index !== nameIndex + 1) || '.'
      const base = normalizeShellPath(baseArg, cwd)
      const pattern = nameIndex >= 0 ? args[nameIndex + 1]?.replaceAll('*', '').toLowerCase() : ''
      return { text: findPaths().filter((path) => path.startsWith(base) && (!pattern || shellBasename(path).toLowerCase().includes(pattern))).join('\n') }
    }
    if (command === 'grep') {
      const flags = args.filter((arg) => arg.startsWith('-')).join('')
      const insensitive = flags.includes('i')
      const numbered = flags.includes('n')
      const cleanArgs = args.filter((arg) => !arg.startsWith('-'))
      const pattern = cleanArgs[0]
      if (!pattern) return { error: 'grep: missing search pattern' }
      let text = stdin
      if (!text && cleanArgs[1]) {
        const file = readFile(cleanArgs[1])
        if (!file) return { error: `grep: ${cleanArgs[1]}: No such file or directory` }
        text = file.text
      }
      if (!text) text = getAllItems(showAll).map((item) => `${item.section}: ${item.title} ${item.subtitle} ${item.description}`).join('\n')
      const query = insensitive ? pattern.toLowerCase() : pattern
      const lines = text.split('\n').filter((line) => (insensitive ? line.toLowerCase() : line).includes(query))
      return { text: lines.map((line, index) => numbered ? `${index + 1}:${line}` : line).join('\n') }
    }
    if (command === 'head' || command === 'tail') {
      const countFlag = args.find((arg) => /^-\d+$/.test(arg))
      const nIndex = args.indexOf('-n')
      const count = Number(countFlag?.slice(1) || (nIndex >= 0 ? args[nIndex + 1] : 10)) || 10
      const fileArg = args.find((arg, index) => !arg.startsWith('-') && index !== nIndex + 1)
      const text = stdin || (fileArg ? readFile(fileArg)?.text : '')
      if (!text && fileArg) return { error: `${command}: ${fileArg}: No such file or directory` }
      const lines = (text || '').split('\n')
      return { text: (command === 'head' ? lines.slice(0, count) : lines.slice(-count)).join('\n') }
    }
    if (command === 'sort' || command === 'uniq') {
      const fileArg = args.find((arg) => !arg.startsWith('-'))
      const text = stdin || (fileArg ? readFile(fileArg)?.text : '') || ''
      if (!text && fileArg) return { error: `${command}: ${fileArg}: No such file or directory` }
      const lines = text.split('\n')
      return { text: (command === 'sort' ? lines.sort() : lines.filter((line, index) => index === 0 || line !== lines[index - 1])).join('\n') }
    }
    if (command === 'wc') {
      const fileArg = args.find((arg) => !arg.startsWith('-'))
      const text = stdin || (fileArg ? readFile(fileArg)?.text : '') || ''
      const lines = text ? text.split('\n').length : 0
      const words = text.trim() ? text.trim().split(/\s+/).length : 0
      return { text: `${String(lines).padStart(7)}${String(words).padStart(8)}${String(text.length).padStart(8)}${fileArg ? ` ${fileArg}` : ''}` }
    }
    if (command === 'basename') return { text: shellBasename(normalizeShellPath(args[0] || '.', cwd)) }
    if (command === 'dirname') return { text: shellDirname(normalizeShellPath(args[0] || '.', cwd)) }
    if (command === 'realpath') return { text: normalizeShellPath(args[0] || '.', cwd) }
    if (command === 'sed') {
      const expression = args[0] || ''
      const fileArg = args[1]
      const text = stdin || (fileArg ? readFile(fileArg)?.text : '') || ''
      if (!text && fileArg) return { error: `sed: ${fileArg}: No such file or directory` }
      const match = expression.match(/^s(.)(.*?)\1(.*?)\1(g?)$/)
      if (!match) return { error: 'sed: only s/old/new/[g] is supported' }
      try {
        return { text: text.replace(new RegExp(match[2], match[4] ? 'g' : ''), match[3]) }
      } catch {
        return { error: 'sed: invalid regular expression' }
      }
    }
    if (command === 'awk') {
      const field = Number((args[0] || '').match(/\$([0-9]+)/)?.[1] || 0)
      const fileArg = args[1]
      const text = stdin || (fileArg ? readFile(fileArg)?.text : '') || ''
      if (!field) return { error: "awk: supported form is '{print $N}'" }
      if (!text && fileArg) return { error: `awk: ${fileArg}: No such file or directory` }
      return { text: text.split('\n').map((line) => line.trim().split(/\s+/)[field - 1] || '').join('\n') }
    }
    if (command === 'cut') {
      const delimiterFlag = args.find((arg) => arg.startsWith('-d'))
      const delimiterIndex = args.indexOf('-d')
      const delimiter = delimiterFlag?.length > 2 ? delimiterFlag.slice(2) : delimiterIndex >= 0 ? args[delimiterIndex + 1] : '\t'
      const fieldFlag = args.find((arg) => arg.startsWith('-f'))
      const fieldIndex = args.indexOf('-f')
      const field = Number(fieldFlag?.length > 2 ? fieldFlag.slice(2) : fieldIndex >= 0 ? args[fieldIndex + 1] : 1) || 1
      const consumed = new Set([
        delimiterFlag,
        fieldFlag,
        delimiterIndex >= 0 ? args[delimiterIndex + 1] : '',
        fieldIndex >= 0 ? args[fieldIndex + 1] : ''
      ].filter(Boolean))
      const fileArg = args.find((arg) => !arg.startsWith('-') && !consumed.has(arg))
      const text = stdin || (fileArg ? readFile(fileArg)?.text : '') || ''
      if (!text && fileArg) return { error: `cut: ${fileArg}: No such file or directory` }
      return { text: text.split('\n').map((line) => line.split(delimiter)[field - 1] || '').join('\n') }
    }
    if (command === 'tr') {
      if (!stdin) return { error: 'tr: missing standard input' }
      const source = args[0] || ''
      const replacement = args[1] || ''
      const replacements = new Map([...source].map((character, index) => [character, replacement[index] ?? replacement.at(-1) ?? '']))
      return { text: [...stdin].map((character) => replacements.get(character) ?? character).join('') }
    }
    return { error: `${command}: command cannot be used in this pipeline` }
  }

  const completions = useMemo(() => {
    const parts = input.trimStart().split(/\s+/)
    const query = parts.at(-1)?.toLowerCase() || ''
    const pathCandidates = cwd === SHELL_HOME
      ? [...SECTION_IDS, 'about.txt', 'contact.vcf', '../', './', '~/']
      : currentSection ? ['../', './', ...getSectionItems(currentSection, showAll).map((item, index) => recordFileName(item, index))] : ['../', './', '~/']
    const pool = parts.length > 1 ? [...pathCandidates, 'on', 'off'] : [...CORE_COMMANDS, ...SECTION_IDS]
    return pool.filter((value) => value.toLowerCase().startsWith(query))
  }, [currentSection, cwd, input, showAll])

  useEffect(() => { scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'auto' }) }, [entries])
  useEffect(() => {
    const focusTerminal = (event) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement || event.target instanceof HTMLButtonElement || event.target instanceof HTMLAnchorElement) return
      inputRef.current?.focus()
    }
    window.addEventListener('keydown', focusTerminal)
    return () => window.removeEventListener('keydown', focusTerminal)
  }, [])

  const changeDirectory = (targetArg = '~') => {
    const target = targetArg === '-' ? previousCwd : normalizeShellPath(targetArg, cwd)
    if (!isDirectory(target)) {
      append({ kind: 'error', text: readFile(targetArg) ? `cd: not a directory: ${targetArg}` : `cd: no such file or directory: ${targetArg}` })
      return
    }
    setPreviousCwd(cwd)
    setCwd(target)
    if (targetArg === '-') append({ kind: 'message', text: target })
  }

  const canWritePath = (path) => path.startsWith(`${SHELL_HOME}/`) || path.startsWith('/tmp/') || path.startsWith('/private/tmp/')

  const openEditor = (targetArg = 'untitled.txt') => {
    const path = normalizeShellPath(targetArg, cwd)
    if (isDirectory(path)) {
      append({ kind: 'error', text: `vi: ${targetArg}: Is a directory` })
      return
    }
    const file = readFile(targetArg)
    if (!file && !isDirectory(shellDirname(path))) {
      append({ kind: 'error', text: `vi: ${targetArg}: No such file or directory` })
      return
    }
    setEditor({ path, text: file?.text || '', readOnly: Boolean(file) && !(path in virtualFiles) || !canWritePath(path) })
  }

  const saveEditor = (path, text) => {
    setVirtualFiles((files) => ({ ...files, [path]: text }))
  }

  const closeEditor = () => {
    setEditor(null)
    requestAnimationFrame(() => inputRef.current?.focus())
  }

  const runCommand = (rawValue) => {
    const raw = rawValue.trim()
    if (!raw) {
      append({ kind: 'prompt', cwd, command: '' })
      setInput('')
      setHistoryIndex(-1)
      return
    }
    const executableRaw = expandShellAlias(raw)
    const promptEntry = { kind: 'prompt', cwd, command: raw }
    const nextHistory = [...history, raw]
    setHistory(nextHistory)
    setHistoryIndex(-1)
    setInput('')

    const controlCommand = tokenizeShell(executableRaw)[0]?.toLowerCase()
    if (controlCommand === 'clear' || controlCommand === 'reset') {
      setEntries([])
      return
    }
    append(promptEntry)

    const redirect = executableRaw.match(/^(.*?)(>>|>)\s*([^\s]+)\s*$/)
    const commandSource = redirect ? redirect[1].trim() : executableRaw
    const pipeline = splitPipeline(commandSource)
    if (pipeline.length > 1 || redirect) {
      let stdin = ''
      for (const stage of pipeline) {
        if (tokenizeShell(stage)[0]?.toLowerCase() === 'pbcopy') {
          writeClipboard(stdin).catch(() => append({ kind: 'error', text: 'pbcopy: clipboard permission denied' }))
          stdin = ''
          continue
        }
        const result = evaluateTextCommand(expandShellAlias(stage), stdin)
        if (result.error) {
          append({ kind: 'error', text: result.error })
          return
        }
        stdin = result.text || ''
      }
      if (redirect) {
        const target = normalizeShellPath(redirect[3], cwd)
        const parent = shellDirname(target)
        if (!isDirectory(parent) || !canWritePath(target)) {
          append({ kind: 'error', text: `zsh: permission denied: ${redirect[3]}` })
          return
        }
        setVirtualFiles((files) => ({ ...files, [target]: redirect[2] === '>>' ? `${files[target] || ''}${stdin}` : stdin }))
      } else append({ kind: 'message', text: stdin })
      return
    }

    const [rawCommand = '', ...args] = tokenizeShell(executableRaw)
    const command = rawCommand.toLowerCase()

    if (args.includes('--help') && command !== 'help') {
      const manual = getCommandManual(command)
      append(manual ? { kind: 'manual', manual } : { kind: 'error', text: `${command}: no help available` })
      return
    }

    if (SECTION_IDS.includes(command)) {
      const target = `${SHELL_HOME}/${command}`
      setPreviousCwd(cwd)
      setCwd(target)
      append({ kind: 'records', section: command, showAll })
      return
    }

    switch (command) {
      case 'help': {
        const target = args[0]?.toLowerCase()
        const manual = target ? getCommandManual(target) : null
        append(target ? manual ? { kind: 'manual', manual } : { kind: 'error', text: `help: no help topics match '${target}'` } : { kind: 'help' })
        break
      }
      case 'pwd': append({ kind: 'message', text: cwd }); break
      case 'cd':
        if (args.length > 1) append({ kind: 'error', text: 'cd: too many arguments' })
        else changeDirectory(args[0])
        break
      case 'ls': {
        const flags = args.filter((arg) => arg.startsWith('-')).join('')
        const targetArg = args.find((arg) => !arg.startsWith('-')) || '.'
        const target = normalizeShellPath(targetArg, cwd)
        const file = readFile(targetArg)
        if (!isDirectory(target) && file) append({ kind: 'message', text: flags.includes('l') ? `-rw-r--r--  taeho  staff  ${shellBasename(file.path)}` : shellBasename(file.path) })
        else if (!isDirectory(target)) append({ kind: 'error', text: `ls: ${targetArg}: No such file or directory` })
        else if (target === SHELL_HOME) append({ kind: 'home-list', showAll, long: flags.includes('l'), hidden: flags.includes('a') })
        else if (sectionFromPath(target)) append({ kind: 'records', section: sectionFromPath(target), showAll, long: flags.includes('l') })
        else append({ kind: 'message', text: pathTextListing(target, flags.includes('l'), flags.includes('a')) })
        break
      }
      case 'cat': {
        const targets = args.filter((arg) => !arg.startsWith('-'))
        const target = targets[0]
        if (!target) append({ kind: 'error', text: 'cat: missing file operand' })
        else if (targets.length > 1) {
          const result = evaluateTextCommand(executableRaw)
          append(result.error ? { kind: 'error', text: result.error } : { kind: 'message', text: result.text })
        }
        else if ((target === 'about' || normalizeShellPath(target, cwd) === `${SHELL_HOME}/about.txt`)) append({ kind: 'about' })
        else if ((target === 'contact' || normalizeShellPath(target, cwd) === `${SHELL_HOME}/contact.vcf`)) append({ kind: 'links' })
        else {
          const file = readFile(target)
          if (!file) append({ kind: 'error', text: `cat: ${target}: No such file or directory` })
          else if (file.record) append({ kind: 'record', item: file.record.item, index: file.record.index })
          else append({ kind: 'message', text: file.text })
        }
        break
      }
      case 'less':
      case 'more': {
        const target = args.find((arg) => !arg.startsWith('-'))
        const file = target ? readFile(target) : null
        append(file ? { kind: 'message', text: file.text } : { kind: 'error', text: `${command}: ${target || 'missing file'}: No such file or directory` })
        break
      }
      case 'vi':
      case 'vim':
      case 'nano': openEditor(args.find((arg) => !arg.startsWith('-'))); break
      case 'file': {
        const targetArg = args[0]
        const target = normalizeShellPath(targetArg || '', cwd)
        const file = readFile(targetArg || '')
        if (isDirectory(target)) append({ kind: 'message', text: `${targetArg}: directory` })
        else if (file) append({ kind: 'message', text: `${targetArg}: ${file.record ? 'UTF-8 Unicode text, Markdown' : 'ASCII text'}` })
        else append({ kind: 'error', text: `file: ${targetArg || ''}: No such file or directory` })
        break
      }
      case 'stat': {
        const targetArg = args[0]
        const target = normalizeShellPath(targetArg || '', cwd)
        const file = readFile(targetArg || '')
        if (!isDirectory(target) && !file) append({ kind: 'error', text: `stat: ${targetArg || ''}: stat: No such file or directory` })
        else append({ kind: 'message', text: `16777234 1 ${isDirectory(target) ? 'drwxr-xr-x' : '-rw-r--r--'} 1 taeho staff 0 ${file?.text.length || 0} "${target}"` })
        break
      }
      case 'open': {
        const target = args[0] || ''
        if (!target) {
          append({ kind: 'error', text: 'Usage: open target' })
          break
        }
        const linkKey = target.toLowerCase()
        const links = { portfolio: profile.portfolio, github: profile.github, linkedin: profile.linkedin, email: `mailto:${profile.email}` }
        const record = resolveRecord(target)
        const file = readFile(target)
        const directory = normalizeShellPath(target || '.', cwd)
        if (links[linkKey]) window.open(links[linkKey], linkKey === 'email' ? '_self' : '_blank', 'noopener,noreferrer')
        else if (record?.item.link) window.open(record.item.link, '_blank', 'noopener,noreferrer')
        else if (record) append({ kind: 'record', item: record.item, index: record.index })
        else if (isDirectory(directory)) append({ kind: 'message', text: pathTextListing(directory) })
        else if (file) append({ kind: 'message', text: file.text })
        else append({ kind: 'error', text: `open: ${target || 'missing target'}: no public link` })
        break
      }
      case 'tree': {
        const lines = ['~/']
        SECTION_META.forEach((section, index) => lines.push(`${index === SECTION_META.length - 1 ? '`--' : '|--'} ${section.id}/ (${profile.sectionCounts[section.id][showAll ? 'total' : 'featured']})`))
        append({ kind: 'message', text: lines.join('\n') })
        break
      }
      case 'whoami': append({ kind: 'message', text: environment.USER }); break
      case 'portfolio': append({ kind: 'about' }); break
      case 'archive': {
        const requested = args[0]?.toLowerCase()
        const next = requested === 'on' ? true : requested === 'off' ? false : !showAll
        setShowAll(next)
        append({ kind: 'message', text: next ? 'Archive records are now included.' : 'Showing featured records only.' })
        break
      }
      case 'history':
        if (args.includes('-c')) setHistory([])
        else append({ kind: 'history', commands: nextHistory })
        break
      case 'echo': {
        const values = args[0] === '-n' ? args.slice(1) : args
        append({ kind: 'message', text: expandVariables(values.join(' '), environment, cwd).replace(/\\n/g, '\n') })
        break
      }
      case 'printf': append({ kind: 'message', text: expandVariables(args.join(' '), environment, cwd).replace(/\\n/g, '\n') }); break
      case 'date': append({ kind: 'message', text: new Date().toString() }); break
      case 'hostname': append({ kind: 'message', text: 'portfolio' }); break
      case 'id': append({ kind: 'message', text: 'uid=501(taeho) gid=20(staff) groups=20(staff),12(everyone),61(localaccounts)' }); break
      case 'uname': append({ kind: 'message', text: args.includes('-a') ? 'Darwin portfolio 24.5.0 Darwin Kernel Version 24.5.0: arm64' : 'Darwin' }); break
      case 'sw_vers': append({ kind: 'message', text: 'ProductName:\t\tmacOS\nProductVersion:\t\t15.5\nBuildVersion:\t\t24F74' }); break
      case 'env':
      case 'printenv': append({ kind: 'message', text: command === 'printenv' && args[0] ? environment[args[0]] || '' : Object.entries({ ...environment, PWD: cwd }).map(([key, value]) => `${key}=${value}`).join('\n') }); break
      case 'export': {
        const assignment = args[0]?.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/)
        if (!assignment) append({ kind: 'error', text: 'export: expected NAME=value' })
        else setEnvironment((current) => ({ ...current, [assignment[1]]: assignment[2] }))
        break
      }
      case 'unset': {
        const key = args[0]
        if (key) setEnvironment((current) => Object.fromEntries(Object.entries(current).filter(([name]) => name !== key)))
        break
      }
      case 'source': {
        const file = readFile(args[0] || '')
        if (!file) append({ kind: 'error', text: `source: no such file or directory: ${args[0] || ''}` })
        else {
          const assignments = file.text.split('\n').map((line) => line.match(/^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)=(.*)$/)).filter(Boolean)
          setEnvironment((current) => ({ ...current, ...Object.fromEntries(assignments.map((match) => [match[1], match[2].replace(/^['"]|['"]$/g, '')])) }))
        }
        break
      }
      case 'which':
      case 'type':
      case 'command': {
        const target = args.at(-1)?.toLowerCase()
        if (!BUILTIN_COMMANDS.has(target)) append({ kind: 'error', text: `${target || ''} not found` })
        else if (SHELL_BUILTINS.has(target)) append({ kind: 'message', text: command === 'type' ? `${target} is a shell builtin` : target })
        else append({ kind: 'message', text: command === 'type' ? `${target} is /usr/bin/${target}` : `/usr/bin/${target}` })
        break
      }
      case 'man': {
        const target = args[0]?.toLowerCase()
        const manual = getCommandManual(target)
        append(manual ? { kind: 'manual', manual } : { kind: 'error', text: `No manual entry for ${target || ''}` })
        break
      }
      case 'find':
      case 'grep':
      case 'head':
      case 'tail':
      case 'wc':
      case 'sort':
      case 'uniq':
      case 'basename':
      case 'dirname':
      case 'realpath':
      case 'sed':
      case 'awk':
      case 'cut':
      case 'tr': {
        const result = evaluateTextCommand(executableRaw)
        append(result.error ? { kind: 'error', text: result.error } : { kind: 'message', text: result.text })
        break
      }
      case 'mkdir': {
        const targets = args.filter((arg) => !arg.startsWith('-')).map((arg) => normalizeShellPath(arg, cwd))
        if (!targets.length) append({ kind: 'error', text: 'mkdir: missing operand' })
        else for (const target of targets) {
          if (!canWritePath(target)) append({ kind: 'error', text: `mkdir: ${target}: Permission denied` })
          else if (!isDirectory(shellDirname(target))) append({ kind: 'error', text: `mkdir: ${target}: No such file or directory` })
          else setVirtualDirectories((current) => current.includes(target) ? current : [...current, target])
        }
        break
      }
      case 'touch': {
        const targets = args.filter((arg) => !arg.startsWith('-')).map((arg) => normalizeShellPath(arg, cwd))
        if (!targets.length) append({ kind: 'error', text: 'touch: missing file operand' })
        else setVirtualFiles((files) => Object.fromEntries([...Object.entries(files), ...targets.filter((target) => isDirectory(shellDirname(target)) && canWritePath(target)).map((target) => [target, files[target] || ''])]))
        break
      }
      case 'rm': {
        const targets = args.filter((arg) => !arg.startsWith('-')).map((arg) => normalizeShellPath(arg, cwd))
        if (!targets.length) append({ kind: 'error', text: 'rm: missing operand' })
        else targets.forEach((target) => {
          if (target in virtualFiles) setVirtualFiles((files) => Object.fromEntries(Object.entries(files).filter(([path]) => path !== target)))
          else if (virtualDirectories.includes(target) && args.some((arg) => arg.includes('r'))) setVirtualDirectories((current) => current.filter((path) => path !== target && !path.startsWith(`${target}/`)))
          else append({ kind: 'error', text: `rm: cannot remove '${shellDisplayPath(target)}': Permission denied or not found` })
        })
        break
      }
      case 'rmdir': {
        const target = normalizeShellPath(args[0] || '', cwd)
        if (virtualDirectories.includes(target) && !immediateVirtualChildren(target).length) setVirtualDirectories((current) => current.filter((path) => path !== target))
        else append({ kind: 'error', text: `rmdir: failed to remove '${args[0] || ''}': Directory not empty or not found` })
        break
      }
      case 'cp':
      case 'mv': {
        const source = normalizeShellPath(args[0] || '', cwd)
        const target = normalizeShellPath(args[1] || '', cwd)
        const sourceFile = readFile(args[0] || '')
        if (!sourceFile || !args[1] || !canWritePath(target) || !isDirectory(shellDirname(target)) || (command === 'mv' && !(source in virtualFiles))) append({ kind: 'error', text: `${command}: invalid source or destination` })
        else {
          setVirtualFiles((files) => {
            const next = { ...files, [target]: sourceFile.text }
            if (command === 'mv') delete next[source]
            return next
          })
        }
        break
      }
      case 'ln': {
        const source = readFile(args[0] || '')
        const target = normalizeShellPath(args[1] || '', cwd)
        if (!source || !args[1] || !canWritePath(target) || !isDirectory(shellDirname(target))) append({ kind: 'error', text: 'ln: invalid source or destination' })
        else setVirtualFiles((files) => ({ ...files, [target]: source.text }))
        break
      }
      case 'chmod': append({ kind: 'message', text: '' }); break
      case 'ps': append({ kind: 'message', text: '  PID TTY           TIME CMD\n 1042 ttys001    0:00.04 -zsh\n 1088 ttys001    0:00.12 portfolio' }); break
      case 'df': append({ kind: 'message', text: 'Filesystem      512-blocks      Used Available Capacity Mounted on\n/dev/disk3s1s1   976490576 196183312 509812416    28%    /' }); break
      case 'du': append({ kind: 'message', text: `${getAllItems(showAll).length * 4}K\t${shellDisplayPath(cwd)}` }); break
      case 'vm_stat': append({ kind: 'message', text: 'Mach Virtual Memory Statistics: (page size of 16384 bytes)\nPages free:                              483921.\nPages active:                            291884.\nPages inactive:                          198442.' }); break
      case 'uptime': append({ kind: 'message', text: `up ${Math.floor(performance.now() / 60000)} min, 1 user, load average: 0.08, 0.12, 0.09` }); break
      case 'top': append({ kind: 'message', text: 'Processes: 2 total, 1 running, 1 sleeping\nLoad Avg: 0.08, 0.12, 0.09\nCPU usage: 1.2% user, 0.4% sys, 98.4% idle\n\nPID  COMMAND      %CPU  MEM\n1088 portfolio     1.2  48M\n1042 zsh           0.0   9M' }); break
      case 'jobs': append({ kind: 'message', text: '' }); break
      case 'kill': append({ kind: 'error', text: args[0] ? `kill: kill ${args[0]} failed: operation not permitted` : 'kill: not enough arguments' }); break
      case 'alias': append({ kind: 'message', text: "ll='ls -la'\nla='ls -a'\nportfolio='cd ~/ && ls'" }); break
      case 'git': append({ kind: 'message', text: args[0] === 'log' ? '45165cd feat: rebuild portfolio views around core content\n31ef064 feat: optimize and expand portfolio views' : 'On branch main\nYour branch is up to date with origin/main.\nnothing to commit, working tree clean' }); break
      case 'pbcopy': {
        writeClipboard(args.join(' ')).catch(() => append({ kind: 'error', text: 'pbcopy: clipboard permission denied' }))
        break
      }
      case 'pbpaste': {
        if (!navigator.clipboard?.readText) append({ kind: 'error', text: 'pbpaste: clipboard unavailable' })
        else navigator.clipboard.readText().then((text) => append({ kind: 'message', text })).catch(() => append({ kind: 'error', text: 'pbpaste: clipboard permission denied' }))
        break
      }
      case 'exit':
        append({ kind: 'message', text: 'logout\n[Session restarted]' })
        setPreviousCwd(cwd)
        setCwd(SHELL_HOME)
        break
      case 'sudo': append({ kind: 'error', text: 'taeho is not in the sudoers file. This incident will be reported.' }); break
      default: append({ kind: 'error', text: `zsh: command not found: ${command}. Type help.` })
    }
  }

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') { event.preventDefault(); runCommand(input); return }
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
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'l') { event.preventDefault(); setEntries([]); return }
    if (event.ctrlKey && event.key.toLowerCase() === 'c') {
      event.preventDefault()
      append({ kind: 'prompt', cwd, command: `${input}^C` })
      setInput('')
      setHistoryIndex(-1)
      return
    }
    if (event.ctrlKey && event.key.toLowerCase() === 'd' && !input) { event.preventDefault(); runCommand('exit') }
  }

  return (
    <main className="shell-view" onPointerDown={() => inputRef.current?.focus()}>
      <div className="shell-wallpaper" aria-hidden="true" />
      <section className={`shell-window ${editor ? 'editor-open' : ''}`}>
        <header className="shell-titlebar">
          <div className="shell-traffic" aria-hidden="true"><i /><i /><i /></div>
          <div className="shell-window-title"><span>Terminal</span><small>{editor ? `${shellDisplayPath(editor.path)} - vi` : `${shellDisplayPath(cwd)} - zsh`}</small></div>
          <span aria-hidden="true" />
        </header>
        {editor ? <ViEditor file={editor} onSave={saveEditor} onExit={closeEditor} /> : (
          <div className="shell-screen" ref={scrollRef}>
            {entries.map((entry) => <Output key={entry.id} entry={entry} />)}
            <div className="shell-live-line">
              <span className="shell-user">taeho@portfolio</span>
              <span className="shell-path">{shellDisplayPath(cwd)}</span>
              <span className="shell-symbol">%</span>
              <input ref={inputRef} value={input} onChange={(event) => setInput(event.target.value)} onKeyDown={handleKeyDown} aria-label="Terminal command" autoFocus autoComplete="off" autoCapitalize="off" spellCheck={false} />
            </div>
          </div>
        )}
      </section>
      <StyleSwitcher />
    </main>
  )
}
