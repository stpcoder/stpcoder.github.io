import { useEffect, useMemo, useRef, useState } from 'react'
import StyleSwitcher from '../StyleSwitcher'
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
import './TerminalView.css'

const SECTION_IDS = SECTION_META.map(({ id }) => id)
const CORE_COMMANDS = [
  'alias', 'archive', 'basename', 'cat', 'cd', 'chmod', 'clear', 'command', 'cp', 'date', 'df', 'dirname',
  'du', 'echo', 'env', 'exit', 'export', 'find', 'free', 'git', 'grep', 'head', 'help', 'history', 'hostname',
  'id', 'jobs', 'la', 'll', 'ls', 'man', 'mkdir', 'mv', 'open', 'portfolio', 'printenv', 'printf', 'ps', 'pwd', 'reset', 'rm',
  'rmdir', 'sort', 'sudo', 'tail', 'top', 'touch', 'tree', 'type', 'uname', 'uniq', 'uptime', 'wc', 'which', 'whoami'
]
const BUILTIN_COMMANDS = new Set([...CORE_COMMANDS, ...SECTION_IDS])
const STATIC_FILES = {
  '/etc/hostname': 'portfolio',
  '/etc/os-release': 'NAME="Portfolio Linux"\nID=portfolio\nPRETTY_NAME="Portfolio Linux 2026"',
  '/etc/shells': '/bin/sh\n/bin/bash\n/bin/zsh',
  [`${SHELL_HOME}/.profile`]: 'export PATH=/usr/local/bin:/usr/bin:/bin\nexport LANG=en_US.UTF-8',
  [`${SHELL_HOME}/.zshrc`]: "alias ll='ls -la'\nalias la='ls -a'",
  [`${SHELL_HOME}/about.txt`]: () => `${profile.name}\n${profile.title}\n${profile.location}\n\n${profile.about}`,
  [`${SHELL_HOME}/contact.vcf`]: () => `EMAIL:${profile.email}\nGITHUB:${profile.github}\nLINKEDIN:${profile.linkedin}`
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
        <strong>{profile.name}</strong>
        <span>{profile.title}</span>
        <small>Type <b>help</b>, or use standard shell commands such as <b>ls -la</b> and <b>cd projects</b>.</small>
      </div>
    )
  }
  if (entry.kind === 'help') {
    return (
      <div className="shell-help">
        <div><code>ls [-la] [path]</code><span>list files and records</span></div>
        <div><code>cd path / cd -</code><span>navigate relative or absolute paths</span></div>
        <div><code>cat file / cat 1</code><span>read files and portfolio records</span></div>
        <div><code>find / grep</code><span>search records and text</span></div>
        <div><code>cmd | grep text</code><span>pipe text through filters</span></div>
        <div><code>echo text &gt; file</code><span>write a temporary browser file</span></div>
        <div><code>mkdir / touch / rm</code><span>edit the virtual home or /tmp</span></div>
        <div><code>man command</code><span>inspect supported command usage</span></div>
      </div>
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
  const [environment, setEnvironment] = useState({ USER: 'taeho', HOME: SHELL_HOME, SHELL: '/bin/zsh', TERM: 'xterm-256color', LANG: 'en_US.UTF-8' })
  const inputRef = useRef(null)
  const scrollRef = useRef(null)
  const entryIdRef = useRef(2)

  const allDirectories = useMemo(() => new Set([
    ...SYSTEM_DIRECTORIES,
    '/var/log',
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
      '/': ['bin/', 'etc/', 'home/', 'tmp/', 'usr/', 'var/'],
      '/home': ['taeho/'],
      '/bin': [...CORE_COMMANDS].sort(),
      '/usr': ['bin/'],
      '/usr/bin': [...CORE_COMMANDS].sort(),
      '/etc': ['hostname', 'os-release', 'shells'],
      '/tmp': [],
      '/var': ['log/'],
      '/var/log': []
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
      const insensitive = args.includes('-i')
      const numbered = args.includes('-n')
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
    if (command === 'sort') return { text: (stdin || '').split('\n').sort().join('\n') }
    if (command === 'uniq') return { text: [...new Set((stdin || '').split('\n'))].join('\n') }
    if (command === 'wc') {
      const fileArg = args.find((arg) => !arg.startsWith('-'))
      const text = stdin || (fileArg ? readFile(fileArg)?.text : '') || ''
      const lines = text ? text.split('\n').length : 0
      const words = text.trim() ? text.trim().split(/\s+/).length : 0
      return { text: `${String(lines).padStart(7)}${String(words).padStart(8)}${String(text.length).padStart(8)}${fileArg ? ` ${fileArg}` : ''}` }
    }
    if (command === 'basename') return { text: shellBasename(normalizeShellPath(args[0] || '.', cwd)) }
    if (command === 'dirname') return { text: shellDirname(normalizeShellPath(args[0] || '.', cwd)) }
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

  useEffect(() => { scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' }) }, [entries])
  useEffect(() => {
    const focusTerminal = (event) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLButtonElement || event.target instanceof HTMLAnchorElement) return
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
        if (!isDirectory(parent) || (!target.startsWith(SHELL_HOME) && !target.startsWith('/tmp'))) {
          append({ kind: 'error', text: `zsh: permission denied: ${redirect[3]}` })
          return
        }
        setVirtualFiles((files) => ({ ...files, [target]: redirect[2] === '>>' ? `${files[target] || ''}${stdin}` : stdin }))
      } else append({ kind: 'message', text: stdin })
      return
    }

    const [rawCommand = '', ...args] = tokenizeShell(executableRaw)
    const command = rawCommand.toLowerCase()

    if (SECTION_IDS.includes(command)) {
      const target = `${SHELL_HOME}/${command}`
      setPreviousCwd(cwd)
      setCwd(target)
      append({ kind: 'records', section: command, showAll })
      return
    }

    switch (command) {
      case 'help': append({ kind: 'help' }); break
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
      case 'open': {
        const target = args[0]?.toLowerCase() || ''
        const links = { github: profile.github, linkedin: profile.linkedin, email: `mailto:${profile.email}` }
        const record = resolveRecord(target)
        if (links[target]) window.open(links[target], target === 'email' ? '_self' : '_blank', 'noopener,noreferrer')
        else if (record?.item.link) window.open(record.item.link, '_blank', 'noopener,noreferrer')
        else append({ kind: 'error', text: `open: ${target || 'missing target'}: no public link` })
        break
      }
      case 'tree': {
        const lines = ['~/']
        SECTION_META.forEach((section, index) => lines.push(`${index === SECTION_META.length - 1 ? '`--' : '|--'} ${section.id}/ (${profile.sectionCounts[section.id][showAll ? 'total' : 'featured']})`))
        append({ kind: 'message', text: lines.join('\n') })
        break
      }
      case 'whoami':
      case 'portfolio': append({ kind: 'about' }); break
      case 'archive': {
        const requested = args[0]?.toLowerCase()
        const next = requested === 'on' ? true : requested === 'off' ? false : !showAll
        setShowAll(next)
        append({ kind: 'message', text: next ? 'Archive records are now included.' : 'Showing featured records only.' })
        break
      }
      case 'history': append({ kind: 'history', commands: nextHistory }); break
      case 'echo': {
        const values = args[0] === '-n' ? args.slice(1) : args
        append({ kind: 'message', text: expandVariables(values.join(' '), environment, cwd).replace(/\\n/g, '\n') })
        break
      }
      case 'printf': append({ kind: 'message', text: expandVariables(args.join(' '), environment, cwd).replace(/\\n/g, '\n') }); break
      case 'date': append({ kind: 'message', text: new Date().toString() }); break
      case 'hostname': append({ kind: 'message', text: 'portfolio' }); break
      case 'id': append({ kind: 'message', text: 'uid=1000(taeho) gid=1000(taeho) groups=1000(taeho),20(staff)' }); break
      case 'uname': append({ kind: 'message', text: args.includes('-a') ? 'Linux portfolio 6.8.0-portfolio #1 SMP PREEMPT_DYNAMIC aarch64 GNU/Linux' : 'Linux' }); break
      case 'env':
      case 'printenv': append({ kind: 'message', text: Object.entries({ ...environment, PWD: cwd }).map(([key, value]) => `${key}=${value}`).join('\n') }); break
      case 'export': {
        const assignment = args[0]?.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/)
        if (!assignment) append({ kind: 'error', text: 'export: expected NAME=value' })
        else setEnvironment((current) => ({ ...current, [assignment[1]]: assignment[2] }))
        break
      }
      case 'which':
      case 'type':
      case 'command': {
        const target = args.at(-1)?.toLowerCase()
        append(BUILTIN_COMMANDS.has(target) ? { kind: 'message', text: command === 'type' ? `${target} is a shell builtin` : `/usr/bin/${target}` } : { kind: 'error', text: `${target || ''} not found` })
        break
      }
      case 'man': {
        const target = args[0]
        append(BUILTIN_COMMANDS.has(target) ? { kind: 'message', text: `${target.toUpperCase()}(1)\n\nSupported in the portfolio shell. Run "help" for examples and ${target} --help for common syntax.` } : { kind: 'error', text: `No manual entry for ${target || ''}` })
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
      case 'dirname': {
        const result = evaluateTextCommand(executableRaw)
        append(result.error ? { kind: 'error', text: result.error } : { kind: 'message', text: result.text })
        break
      }
      case 'mkdir': {
        const targets = args.filter((arg) => !arg.startsWith('-')).map((arg) => normalizeShellPath(arg, cwd))
        if (!targets.length) append({ kind: 'error', text: 'mkdir: missing operand' })
        else for (const target of targets) {
          if (!target.startsWith(SHELL_HOME) && !target.startsWith('/tmp')) append({ kind: 'error', text: `mkdir: ${target}: Permission denied` })
          else if (!isDirectory(shellDirname(target))) append({ kind: 'error', text: `mkdir: ${target}: No such file or directory` })
          else setVirtualDirectories((current) => current.includes(target) ? current : [...current, target])
        }
        break
      }
      case 'touch': {
        const targets = args.filter((arg) => !arg.startsWith('-')).map((arg) => normalizeShellPath(arg, cwd))
        if (!targets.length) append({ kind: 'error', text: 'touch: missing file operand' })
        else setVirtualFiles((files) => Object.fromEntries([...Object.entries(files), ...targets.filter((target) => isDirectory(shellDirname(target)) && (target.startsWith(SHELL_HOME) || target.startsWith('/tmp'))).map((target) => [target, files[target] || ''])]))
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
        if (!(source in virtualFiles) || !isDirectory(shellDirname(target))) append({ kind: 'error', text: `${command}: invalid source or destination` })
        else {
          setVirtualFiles((files) => {
            const next = { ...files, [target]: files[source] }
            if (command === 'mv') delete next[source]
            return next
          })
        }
        break
      }
      case 'chmod': append({ kind: 'message', text: '' }); break
      case 'ps': append({ kind: 'message', text: '  PID TTY          TIME CMD\n 1000 pts/0    00:00:00 zsh\n 1012 pts/0    00:00:00 portfolio' }); break
      case 'df': append({ kind: 'message', text: 'Filesystem      Size  Used Avail Use% Mounted on\nportfolio       72G   26G   46G  36% /home/taeho' }); break
      case 'du': append({ kind: 'message', text: `${getAllItems(showAll).length * 4}K\t${shellDisplayPath(cwd)}` }); break
      case 'free': append({ kind: 'message', text: '               total        used        free\nMem:           16384        4096       12288\nSwap:           2048           0        2048' }); break
      case 'uptime': append({ kind: 'message', text: `up ${Math.floor(performance.now() / 60000)} min, 1 user, load average: 0.08, 0.12, 0.09` }); break
      case 'top': append({ kind: 'message', text: 'top - portfolio shell\nTasks: 2 total, 1 running, 1 sleeping\n%Cpu(s): 1.2 us, 0.4 sy, 98.4 id\n\nPID USER   %CPU %MEM COMMAND\n1012 taeho   1.2  0.3 portfolio\n1000 taeho   0.0  0.1 zsh' }); break
      case 'jobs': append({ kind: 'message', text: 'no current jobs' }); break
      case 'alias': append({ kind: 'message', text: "ll='ls -la'\nla='ls -a'\nportfolio='cd ~/ && ls'" }); break
      case 'git': append({ kind: 'message', text: args[0] === 'log' ? '45165cd feat: rebuild portfolio views around core content\n31ef064 feat: optimize and expand portfolio views' : 'On branch main\nYour branch is up to date with origin/main.\nnothing to commit, working tree clean' }); break
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
      <section className="shell-window">
        <header className="shell-titlebar">
          <div className="shell-traffic" aria-hidden="true"><i /><i /><i /></div>
          <div className="shell-window-title"><span>Terminal</span><small>{shellDisplayPath(cwd)} - zsh</small></div>
          <span aria-hidden="true" />
        </header>
        <div className="shell-screen" ref={scrollRef}>
          {entries.map((entry) => <Output key={entry.id} entry={entry} />)}
          <div className="shell-live-line">
            <span className="shell-user">taeho@portfolio</span>
            <span className="shell-path">{shellDisplayPath(cwd)}</span>
            <span className="shell-symbol">%</span>
            <input ref={inputRef} value={input} onChange={(event) => setInput(event.target.value)} onKeyDown={handleKeyDown} aria-label="Terminal command" autoFocus autoComplete="off" autoCapitalize="off" spellCheck={false} />
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
