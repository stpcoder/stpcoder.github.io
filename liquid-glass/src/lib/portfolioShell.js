export const SHELL_HOME = '/home/taeho'
export const SYSTEM_DIRECTORIES = ['/', '/bin', '/etc', '/home', SHELL_HOME, '/tmp', '/usr', '/usr/bin', '/var']

export function normalizeShellPath(input = '', cwd = SHELL_HOME) {
  const value = input.trim() || SHELL_HOME
  const expanded = value === '~'
    ? SHELL_HOME
    : value.startsWith('~/')
      ? `${SHELL_HOME}/${value.slice(2)}`
      : value
  const segments = (expanded.startsWith('/') ? [] : cwd.split('/').filter(Boolean))

  for (const segment of expanded.split('/')) {
    if (!segment || segment === '.') continue
    if (segment === '..') segments.pop()
    else segments.push(segment)
  }

  return `/${segments.join('/')}`
}

export function shellDisplayPath(path) {
  if (path === SHELL_HOME) return '~'
  if (path.startsWith(`${SHELL_HOME}/`)) return `~/${path.slice(SHELL_HOME.length + 1)}`
  return path
}

export function shellBasename(path) {
  if (path === '/') return '/'
  return path.replace(/\/$/, '').split('/').at(-1) || '/'
}

export function shellDirname(path) {
  if (path === '/') return '/'
  const parts = path.replace(/\/$/, '').split('/').filter(Boolean)
  parts.pop()
  return parts.length ? `/${parts.join('/')}` : '/'
}

export function tokenizeShell(value) {
  return value.match(/(?:[^\s"']+|"[^"]*"|'[^']*')+/g)?.map((part) => part.replace(/^("|')|("|')$/g, '')) || []
}

export function splitPipeline(value) {
  const parts = []
  let quote = ''
  let current = ''

  for (const character of value) {
    if ((character === '"' || character === "'") && (!quote || quote === character)) {
      quote = quote ? '' : character
      current += character
    } else if (character === '|' && !quote) {
      parts.push(current.trim())
      current = ''
    } else {
      current += character
    }
  }

  if (current.trim()) parts.push(current.trim())
  return parts
}
