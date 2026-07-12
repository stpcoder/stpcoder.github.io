export const COMMAND_GROUPS = [
  { label: 'navigation', commands: ['pwd', 'cd', 'ls', 'tree', 'find', 'open', 'realpath', 'basename', 'dirname'] },
  { label: 'files', commands: ['cat', 'less', 'more', 'file', 'stat', 'touch', 'mkdir', 'rmdir', 'cp', 'mv', 'rm', 'chmod', 'ln'] },
  { label: 'text', commands: ['echo', 'printf', 'grep', 'head', 'tail', 'sort', 'uniq', 'wc', 'sed', 'awk', 'cut', 'tr'] },
  { label: 'editors', commands: ['vi', 'vim', 'nano'] },
  { label: 'shell', commands: ['help', 'man', 'history', 'alias', 'export', 'unset', 'env', 'printenv', 'which', 'type', 'command', 'source', 'clear', 'reset', 'exit'] },
  { label: 'system', commands: ['date', 'hostname', 'whoami', 'id', 'uname', 'sw_vers', 'ps', 'top', 'jobs', 'kill', 'df', 'du', 'vm_stat', 'uptime'] },
  { label: 'macos', commands: ['pbcopy', 'pbpaste'] },
  { label: 'portfolio', commands: ['portfolio', 'archive', 'git', 'sudo'] }
]

export const COMMAND_MANUALS = {
  help: ['help [command]', 'List supported commands or show command usage.'],
  pwd: ['pwd', 'Print the current working directory.'],
  cd: ['cd [directory] | cd -', 'Change the current working directory.'],
  ls: ['ls [-la] [path]', 'List directory contents.'],
  tree: ['tree [path]', 'Show the portfolio directory tree.'],
  find: ['find [path] [-name pattern]', 'Search the virtual file system.'],
  open: ['open target', 'Open a portfolio link or linked record.'],
  realpath: ['realpath path', 'Print a normalized absolute path.'],
  basename: ['basename path', 'Print the final path component.'],
  dirname: ['dirname path', 'Print the parent directory.'],
  cat: ['cat file...', 'Concatenate and print files.'],
  less: ['less file', 'Read a file in the terminal output.'],
  more: ['more file', 'Read a file in the terminal output.'],
  file: ['file path', 'Describe a file or directory.'],
  stat: ['stat path', 'Show virtual file metadata.'],
  touch: ['touch file...', 'Create empty files in your home directory or /tmp.'],
  mkdir: ['mkdir directory...', 'Create virtual directories.'],
  rmdir: ['rmdir directory', 'Remove an empty virtual directory.'],
  cp: ['cp source destination', 'Copy a virtual file.'],
  mv: ['mv source destination', 'Move a virtual file.'],
  rm: ['rm [-r] path...', 'Remove virtual files or directories.'],
  chmod: ['chmod mode path', 'Change virtual permissions.'],
  ln: ['ln source destination', 'Create a virtual file link.'],
  echo: ['echo [-n] text', 'Print text and expand shell variables.'],
  printf: ['printf format', 'Print formatted text with escaped newlines.'],
  grep: ['grep [-in] pattern [file]', 'Search text by pattern.'],
  head: ['head [-n count] [file]', 'Print the first lines of text.'],
  tail: ['tail [-n count] [file]', 'Print the last lines of text.'],
  sort: ['sort [file]', 'Sort lines.'],
  uniq: ['uniq [file]', 'Remove adjacent duplicate lines.'],
  wc: ['wc [file]', 'Count lines, words, and bytes.'],
  sed: ['sed s/old/new/[g] [file]', 'Apply a basic substitution to text.'],
  awk: ["awk '{print $N}' [file]", 'Print one whitespace-delimited field.'],
  cut: ['cut -d delimiter -f field [file]', 'Select a delimited field.'],
  tr: ['tr source replacement', 'Translate characters from standard input.'],
  vi: ['vi [file]', 'Open the interactive vi editor. Esc returns to normal mode; :w, :q, and :wq are supported.'],
  vim: ['vim [file]', 'Open the interactive vi-compatible editor.'],
  nano: ['nano [file]', 'Open the interactive editor using the same browser-safe editing surface.'],
  history: ['history [-c]', 'Print or clear command history.'],
  alias: ['alias', 'List shell aliases.'],
  export: ['export NAME=value', 'Set an environment variable.'],
  unset: ['unset NAME', 'Remove an environment variable.'],
  env: ['env', 'Print the environment.'],
  printenv: ['printenv [NAME]', 'Print the environment or one variable.'],
  which: ['which command', 'Locate a supported command.'],
  type: ['type command', 'Describe how a command resolves.'],
  command: ['command -v name', 'Locate a command without aliases.'],
  source: ['source file', 'Load export assignments from a shell file.'],
  man: ['man command', 'Show the manual entry for a supported command.'],
  clear: ['clear', 'Clear the terminal scrollback.'],
  reset: ['reset', 'Reset the terminal display.'],
  exit: ['exit', 'Restart the portfolio shell session.'],
  pbcopy: ['pbcopy', 'Copy standard input to the system clipboard.'],
  pbpaste: ['pbpaste', 'Print text from the system clipboard.'],
  sw_vers: ['sw_vers', 'Print the simulated macOS product version.'],
  archive: ['archive [on|off]', 'Include or hide non-featured profile records.'],
  portfolio: ['portfolio', 'Print Taeho Je\'s public profile summary.']
}

export const CORE_COMMANDS = [...new Set(COMMAND_GROUPS.flatMap(({ commands }) => commands))]

export function getCommandManual(command) {
  const manual = COMMAND_MANUALS[command]
  if (manual) return { command, synopsis: manual[0], description: manual[1] }
  if (CORE_COMMANDS.includes(command)) return { command, synopsis: command, description: 'Supported by the portfolio shell.' }
  return null
}
