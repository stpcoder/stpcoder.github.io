import { useEffect, useRef, useState } from 'react'
import { shellDisplayPath } from '../../lib/portfolioShell'

function linePosition(text, cursor) {
  const before = text.slice(0, cursor)
  const line = before.split('\n').length - 1
  const column = before.length - before.lastIndexOf('\n') - 1
  return { line, column }
}

function cursorForLine(text, line, column) {
  const lines = text.split('\n')
  const targetLine = Math.max(0, Math.min(line, lines.length - 1))
  const prefix = lines.slice(0, targetLine).reduce((length, value) => length + value.length + 1, 0)
  return prefix + Math.min(column, lines[targetLine].length)
}

export default function ViEditor({ file, onSave, onExit }) {
  const [text, setText] = useState(file.text)
  const [mode, setMode] = useState('normal')
  const [command, setCommand] = useState('')
  const [message, setMessage] = useState(file.readOnly ? '"readonly"' : '')
  const [dirty, setDirty] = useState(false)
  const [numbers, setNumbers] = useState(false)
  const textareaRef = useRef(null)
  const previousTextRef = useRef(file.text)
  const savedTextRef = useRef(file.text)
  const pendingKeyRef = useRef('')

  useEffect(() => { textareaRef.current?.focus() }, [mode])

  const placeCursor = (position) => {
    requestAnimationFrame(() => {
      const target = textareaRef.current
      if (!target) return
      target.focus()
      target.setSelectionRange(position, position)
    })
  }

  const updateText = (next, cursor) => {
    previousTextRef.current = text
    setText(next)
    setDirty(next !== savedTextRef.current)
    placeCursor(cursor)
  }

  const moveCursor = (direction) => {
    const target = textareaRef.current
    if (!target) return
    const cursor = target.selectionStart
    const { line, column } = linePosition(text, cursor)
    if (direction === 'left') placeCursor(Math.max(0, cursor - 1))
    if (direction === 'right') placeCursor(Math.min(text.length, cursor + 1))
    if (direction === 'up') placeCursor(cursorForLine(text, line - 1, column))
    if (direction === 'down') placeCursor(cursorForLine(text, line + 1, column))
    if (direction === 'start') placeCursor(cursorForLine(text, line, 0))
    if (direction === 'end') placeCursor(cursorForLine(text, line, Number.MAX_SAFE_INTEGER))
  }

  const deleteLine = () => {
    const cursor = textareaRef.current?.selectionStart || 0
    const { line } = linePosition(text, cursor)
    const lines = text.split('\n')
    lines.splice(line, 1)
    const next = lines.join('\n')
    updateText(next, cursorForLine(next, Math.min(line, lines.length - 1), 0))
  }

  const runExCommand = () => {
    const value = command.trim()
    setCommand('')
    setMode('normal')

    if (value === 'q' && dirty) { setMessage('E37: No write since last change (add ! to override)'); return }
    if (value === 'q' || value === 'q!') { onExit(); return }
    if (value === 'set number' || value === 'set nu') { setNumbers(true); setMessage(''); return }
    if (value === 'set nonumber' || value === 'set nonu') { setNumbers(false); setMessage(''); return }
    if (value === 'w' || value === 'wq' || value === 'x') {
      if (file.readOnly) { setMessage("E45: 'readonly' option is set"); return }
      onSave(file.path, text)
      savedTextRef.current = text
      setDirty(false)
      setMessage(`"${shellDisplayPath(file.path)}" ${text.split('\n').length}L, ${text.length}B written`)
      if (value !== 'w') onExit()
      return
    }
    setMessage(`E492: Not an editor command: ${value}`)
  }

  const handleKeyDown = (event) => {
    if (mode === 'insert') {
      if (event.key === 'Escape') { event.preventDefault(); setMode('normal'); setMessage('') }
      return
    }

    if (mode === 'command') {
      if (event.key === 'Escape') { event.preventDefault(); setCommand(''); setMode('normal') }
      if (event.key === 'Enter') { event.preventDefault(); runExCommand() }
      return
    }

    if (event.metaKey || event.ctrlKey || event.altKey) return
    const key = event.key
    if (['i', 'a', 'o', ':', 'h', 'j', 'k', 'l', 'x', 'd', 'u', '0', '$'].includes(key)) event.preventDefault()

    if (key === 'i') { setMode('insert'); setMessage('-- INSERT --'); return }
    if (key === 'a') { moveCursor('right'); setMode('insert'); setMessage('-- INSERT --'); return }
    if (key === 'o') {
      const cursor = textareaRef.current?.selectionStart || 0
      const { line } = linePosition(text, cursor)
      const insertAt = cursorForLine(text, line, Number.MAX_SAFE_INTEGER)
      updateText(`${text.slice(0, insertAt)}\n${text.slice(insertAt)}`, insertAt + 1)
      setMode('insert')
      setMessage('-- INSERT --')
      return
    }
    if (key === ':') { setMode('command'); setCommand(''); return }
    if (key === 'h') moveCursor('left')
    if (key === 'l') moveCursor('right')
    if (key === 'k') moveCursor('up')
    if (key === 'j') moveCursor('down')
    if (key === '0') moveCursor('start')
    if (key === '$') moveCursor('end')
    if (key === 'x') {
      const cursor = textareaRef.current?.selectionStart || 0
      if (cursor < text.length) updateText(`${text.slice(0, cursor)}${text.slice(cursor + 1)}`, cursor)
    }
    if (key === 'd') {
      if (pendingKeyRef.current === 'd') { deleteLine(); pendingKeyRef.current = '' }
      else pendingKeyRef.current = 'd'
      return
    }
    if (key === 'u') {
      const previous = previousTextRef.current
      previousTextRef.current = text
      setText(previous)
      setDirty(previous !== savedTextRef.current)
    }
    if (key !== 'd') pendingKeyRef.current = ''
  }

  const lines = text.split('\n')

  return (
    <section className="shell-vi" aria-label={`vi editor: ${shellDisplayPath(file.path)}`}>
      <div className={`shell-vi-buffer ${numbers ? 'numbered' : ''}`}>
        {numbers ? <pre aria-hidden="true">{lines.map((_, index) => index + 1).join('\n')}</pre> : null}
        <textarea
          ref={textareaRef}
          value={text}
          readOnly={mode !== 'insert'}
          onChange={(event) => {
            previousTextRef.current = text
            setText(event.target.value)
            setDirty(event.target.value !== savedTextRef.current)
          }}
          onKeyDown={handleKeyDown}
          autoFocus
          spellCheck={false}
          aria-label="Editor buffer"
        />
      </div>
      <footer className="shell-vi-status">
        <strong>{mode === 'insert' ? '-- INSERT --' : mode === 'command' ? `:${command}` : shellDisplayPath(file.path)}</strong>
        <span>{dirty ? '[+]' : ''} {lines.length}L {text.length}B</span>
      </footer>
      <div className="shell-vi-command">
        {mode === 'command' ? <><span>:</span><input value={command} onChange={(event) => setCommand(event.target.value)} onKeyDown={handleKeyDown} autoFocus aria-label="vi command" /></> : <span>{message}</span>}
      </div>
    </section>
  )
}
