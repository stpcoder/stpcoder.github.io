import { useState, useRef, useEffect } from 'react'
import StyleSwitcher from '../StyleSwitcher'
import resumeData from '../../data/resume-data.json'

// Helper to get text from multilingual field
const getText = (field, lang = 'en') => {
  if (typeof field === 'string') return field
  if (field && typeof field === 'object') return field[lang] || field.en || field.ko || ''
  return ''
}

// Get featured items only
const getFeaturedItems = (items) => items?.filter(item => item.featured !== false) || []

// Available commands
const COMMANDS = [
  { cmd: '/help', desc: 'Show available commands' },
  { cmd: '/about', desc: 'About me' },
  { cmd: '/education', desc: 'Education history' },
  { cmd: '/experience', desc: 'Work experience' },
  { cmd: '/skills', desc: 'Technical skills' },
  { cmd: '/projects', desc: 'Featured projects' },
  { cmd: '/awards', desc: 'Awards & achievements' },
  { cmd: '/contact', desc: 'Contact information' },
  { cmd: '/all', desc: 'Show everything' },
  { cmd: '/clear', desc: 'Clear terminal' }
]

export default function TerminalView() {
  const [history, setHistory] = useState([
    { type: 'system', text: 'Welcome to TaehoOS v2.0' },
    { type: 'system', text: 'Type /help for available commands' },
    { type: 'prompt', text: '' }
  ])
  const [input, setInput] = useState('')
  const [commandHistory, setCommandHistory] = useState([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [suggestions, setSuggestions] = useState([])
  const [selectedSuggestion, setSelectedSuggestion] = useState(0)
  const inputRef = useRef(null)
  const terminalRef = useRef(null)

  const skills = resumeData.skills?.programming?.map(s => s.name) || []
  const technologies = resumeData.skills?.technologies?.map(s => s.name) || []

  // Update suggestions based on input
  useEffect(() => {
    if (input.startsWith('/')) {
      const filtered = COMMANDS.filter(c =>
        c.cmd.toLowerCase().startsWith(input.toLowerCase())
      )
      setSuggestions(filtered)
      setSelectedSuggestion(0)
    } else {
      setSuggestions([])
    }
  }, [input])

  // Auto-scroll to bottom
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight
    }
  }, [history])

  // Focus input on click
  const handleTerminalClick = () => {
    inputRef.current?.focus()
  }

  const processCommand = (cmd) => {
    const trimmed = cmd.trim().toLowerCase()

    // Add to command history
    if (trimmed) {
      setCommandHistory(prev => [...prev, cmd])
      setHistoryIndex(-1)
    }

    // Show command first
    setHistory(prev => {
      const withoutLastPrompt = prev.slice(0, -1)
      return [
        ...withoutLastPrompt,
        { type: 'command', text: cmd }
      ]
    })

    let output = []

    switch (trimmed) {
      case '/help':
      case 'help':
        output = [
          '📚 Available Commands:',
          '─────────────────────────────────',
          '/about      - About me',
          '/education  - Education history',
          '/experience - Work experience',
          '/skills     - Technical skills',
          '/projects   - Featured projects',
          '/awards     - Awards & achievements',
          '/contact    - Contact information',
          '/all        - Show everything',
          '/clear      - Clear terminal',
          '─────────────────────────────────',
          'Tip: Type / to see suggestions'
        ]
        break

      case '/about':
      case 'about':
        output = [
          `┌─ ABOUT ─────────────────────────`,
          `│ Name: ${getText(resumeData.personal.name)}`,
          `│ Title: ${getText(resumeData.personal.title)}`,
          `│ Location: ${getText(resumeData.personal.location)}`,
          `└─────────────────────────────────`,
          '',
          getText(resumeData.about)
        ]
        break

      case '/education':
      case 'education':
        output = ['┌─ EDUCATION ──────────────────────']
        getFeaturedItems(resumeData.education).forEach((edu, i) => {
          output.push(`│ ${getText(edu.institution)}`)
          output.push(`│ ${getText(edu.degree)}`)
          output.push(`│ ${edu.period}`)
          if (i < getFeaturedItems(resumeData.education).length - 1) output.push('│')
        })
        output.push('└───────────────────────────────────')
        break

      case '/experience':
      case 'experience':
        output = ['┌─ EXPERIENCE ─────────────────────']
        getFeaturedItems(resumeData.experience).forEach((exp, i) => {
          output.push(`│ 💼 ${getText(exp.company)}`)
          output.push(`│    ${getText(exp.position)}`)
          output.push(`│    ${exp.period}`)
          if (exp.description) {
            const desc = getText(exp.description)
            desc.split('\n').forEach(line => {
              output.push(`│    → ${line}`)
            })
          }
          if (i < getFeaturedItems(resumeData.experience).length - 1) output.push('│')
        })
        output.push('└───────────────────────────────────')
        break

      case '/skills':
      case 'skills':
        output = [
          '┌─ TECHNICAL SKILLS ───────────────',
          '│',
          '│ 💻 Programming Languages:',
          `│    ${skills.join(', ')}`,
          '│',
          '│ 🛠️ Technologies & Tools:',
          `│    ${technologies.join(', ')}`,
          '│',
          '└───────────────────────────────────'
        ]
        break

      case '/projects':
      case 'projects':
        output = ['┌─ FEATURED PROJECTS ──────────────']
        const projects = getFeaturedItems(resumeData.projects || [])
        projects.forEach((proj, i) => {
          output.push(`│ 🚀 ${getText(proj.title)}`)
          if (proj.description) {
            output.push(`│    ${getText(proj.description).substring(0, 60)}...`)
          }
          if (proj.technologies) {
            output.push(`│    Tech: ${proj.technologies.slice(0, 4).join(', ')}`)
          }
          if (i < projects.length - 1) output.push('│')
        })
        if (projects.length === 0) {
          output.push('│ No featured projects found.')
        }
        output.push('└───────────────────────────────────')
        break

      case '/awards':
      case 'awards':
        output = ['┌─ AWARDS & ACHIEVEMENTS ──────────']
        resumeData.awards?.forEach(category => {
          const featuredItems = getFeaturedItems(category.items)
          if (featuredItems.length > 0) {
            output.push(`│ 📁 ${getText(category.category)}`)
            featuredItems.forEach(award => {
              output.push(`│    🏆 ${getText(award.title)}`)
              output.push(`│       ${getText(award.organization)} (${award.year})`)
            })
            output.push('│')
          }
        })
        output.push('└───────────────────────────────────')
        break

      case '/contact':
      case 'contact':
        output = [
          '┌─ CONTACT ────────────────────────',
          `│ 📧 Email: ${resumeData.personal.email}`,
          `│ 🔗 GitHub: ${resumeData.personal.github}`,
          `│ 💼 LinkedIn: ${resumeData.personal.linkedin}`,
          `│ 🌐 Portfolio: ${resumeData.personal.portfolio}`,
          '└───────────────────────────────────'
        ]
        break

      case '/all':
      case 'all':
        output = [
          '═══════════════════════════════════',
          '         FULL RESUME OUTPUT        ',
          '═══════════════════════════════════',
          ''
        ]
        output.push(`Name: ${getText(resumeData.personal.name)}`)
        output.push(`Title: ${getText(resumeData.personal.title)}`)
        output.push(`Location: ${getText(resumeData.personal.location)}`)
        output.push('')
        output.push('--- EDUCATION ---')
        getFeaturedItems(resumeData.education).forEach(edu => {
          output.push(`• ${getText(edu.institution)} - ${getText(edu.degree)} (${edu.period})`)
        })
        output.push('')
        output.push('--- EXPERIENCE ---')
        getFeaturedItems(resumeData.experience).forEach(exp => {
          output.push(`• ${getText(exp.company)} - ${getText(exp.position)} (${exp.period})`)
        })
        output.push('')
        output.push('--- SKILLS ---')
        output.push(`Languages: ${skills.join(', ')}`)
        output.push(`Technologies: ${technologies.join(', ')}`)
        output.push('')
        output.push('═══════════════════════════════════')
        break

      case '/clear':
      case 'clear':
        setHistory([
          { type: 'system', text: 'Terminal cleared.' },
          { type: 'prompt', text: '' }
        ])
        return

      case '':
        setHistory(prev => [...prev, { type: 'prompt', text: '' }])
        return

      default:
        output = [
          `Command not found: ${cmd}`,
          'Type /help for available commands'
        ]
    }

    setHistory(prev => [
      ...prev,
      ...output.map(line => ({ type: 'output', text: line })),
      { type: 'prompt', text: '' }
    ])
  }

  const handleKeyDown = (e) => {
    // Handle suggestions navigation
    if (suggestions.length > 0) {
      if (e.key === 'Tab' || (e.key === 'Enter' && suggestions.length > 0 && input !== suggestions[selectedSuggestion]?.cmd)) {
        e.preventDefault()
        setInput(suggestions[selectedSuggestion].cmd)
        setSuggestions([])
        return
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedSuggestion(prev =>
          prev < suggestions.length - 1 ? prev + 1 : prev
        )
        return
      }
      if (e.key === 'ArrowUp' && suggestions.length > 0) {
        e.preventDefault()
        setSelectedSuggestion(prev => prev > 0 ? prev - 1 : 0)
        return
      }
      if (e.key === 'Escape') {
        setSuggestions([])
        return
      }
    }

    if (e.key === 'Enter') {
      setSuggestions([])
      processCommand(input)
      setInput('')
    } else if (e.key === 'ArrowUp' && suggestions.length === 0) {
      e.preventDefault()
      if (commandHistory.length > 0) {
        const newIndex = historyIndex < commandHistory.length - 1 ? historyIndex + 1 : historyIndex
        setHistoryIndex(newIndex)
        setInput(commandHistory[commandHistory.length - 1 - newIndex] || '')
      }
    } else if (e.key === 'ArrowDown' && suggestions.length === 0) {
      e.preventDefault()
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1
        setHistoryIndex(newIndex)
        setInput(commandHistory[commandHistory.length - 1 - newIndex] || '')
      } else if (historyIndex === 0) {
        setHistoryIndex(-1)
        setInput('')
      }
    }
  }

  const selectSuggestion = (cmd) => {
    setInput(cmd)
    setSuggestions([])
    inputRef.current?.focus()
  }

  return (
    <div className="terminal-view" onClick={handleTerminalClick}>
      <div className="terminal-window">
        <div className="terminal-header">
          <div className="terminal-buttons">
            <span className="terminal-btn red"></span>
            <span className="terminal-btn yellow"></span>
            <span className="terminal-btn green"></span>
          </div>
          <span className="terminal-title">taeho@portfolio ~ zsh</span>
        </div>
        <div className="terminal-body" ref={terminalRef}>
          {history.map((item, i) => {
            if (item.type === 'system') {
              return <p key={i} className="system">{item.text}</p>
            }
            if (item.type === 'command') {
              return <p key={i}><span className="prompt">$</span> {item.text}</p>
            }
            if (item.type === 'output') {
              return <p key={i} className="output">{item.text}</p>
            }
            if (item.type === 'prompt') {
              return (
                <div key={i} className="input-wrapper">
                  <div className="input-line">
                    <span className="prompt">$</span>
                    <input
                      ref={i === history.length - 1 ? inputRef : null}
                      type="text"
                      value={i === history.length - 1 ? input : ''}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      className="terminal-input"
                      autoFocus
                      spellCheck={false}
                    />
                  </div>
                  {i === history.length - 1 && suggestions.length > 0 && (
                    <div className="suggestions">
                      {suggestions.map((s, idx) => (
                        <div
                          key={s.cmd}
                          className={`suggestion-item ${idx === selectedSuggestion ? 'selected' : ''}`}
                          onClick={() => selectSuggestion(s.cmd)}
                        >
                          <span className="suggestion-cmd">{s.cmd}</span>
                          <span className="suggestion-desc">{s.desc}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            }
            return null
          })}
        </div>
      </div>
      <StyleSwitcher />
      <style>{`
        .terminal-view {
          min-height: 100vh;
          background: #1a1a2e;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', monospace;
        }
        .terminal-window {
          width: 100%;
          max-width: 900px;
          height: 80vh;
          background: #0d0d0d;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 20px 60px rgba(0,0,0,0.5);
          display: flex;
          flex-direction: column;
        }
        .terminal-header {
          background: #2d2d2d;
          padding: 12px 16px;
          display: flex;
          align-items: center;
          gap: 12px;
          flex-shrink: 0;
        }
        .terminal-buttons {
          display: flex;
          gap: 8px;
        }
        .terminal-btn {
          width: 12px;
          height: 12px;
          border-radius: 50%;
        }
        .terminal-btn.red { background: #ff5f56; }
        .terminal-btn.yellow { background: #ffbd2e; }
        .terminal-btn.green { background: #27c93f; }
        .terminal-title {
          color: #888;
          font-size: 13px;
        }
        .terminal-body {
          flex: 1;
          padding: 20px;
          color: #00ff00;
          font-size: 14px;
          line-height: 1.6;
          overflow-y: auto;
          cursor: text;
        }
        .terminal-body p {
          margin: 0;
          padding: 2px 0;
          white-space: pre-wrap;
          word-break: break-word;
        }
        .prompt {
          color: #00ff00;
          margin-right: 8px;
        }
        .output {
          color: #ccc;
          padding-left: 0;
        }
        .system {
          color: #888;
          font-style: italic;
        }
        .input-wrapper {
          position: relative;
        }
        .input-line {
          display: flex;
          align-items: center;
        }
        .terminal-input {
          flex: 1;
          background: transparent;
          border: none;
          color: #00ff00;
          font-family: inherit;
          font-size: inherit;
          outline: none;
          caret-color: #00ff00;
        }
        .terminal-input::selection {
          background: rgba(0, 255, 0, 0.3);
        }

        /* Suggestions */
        .suggestions {
          margin-top: 4px;
          margin-left: 20px;
          background: #1a1a1a;
          border: 1px solid #333;
          border-radius: 4px;
          overflow: hidden;
          max-width: 400px;
        }
        .suggestion-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 6px 12px;
          cursor: pointer;
          transition: background 0.1s;
        }
        .suggestion-item:hover,
        .suggestion-item.selected {
          background: #2a2a2a;
        }
        .suggestion-cmd {
          color: #888;
          font-weight: 500;
        }
        .suggestion-item.selected .suggestion-cmd,
        .suggestion-item:hover .suggestion-cmd {
          color: #00ff00;
        }
        .suggestion-desc {
          color: #555;
          font-size: 0.85em;
          margin-left: 1rem;
        }

        /* Scrollbar */
        .terminal-body::-webkit-scrollbar {
          width: 8px;
        }
        .terminal-body::-webkit-scrollbar-track {
          background: #1a1a1a;
        }
        .terminal-body::-webkit-scrollbar-thumb {
          background: #444;
          border-radius: 4px;
        }
        .terminal-body::-webkit-scrollbar-thumb:hover {
          background: #555;
        }

        @media (max-width: 768px) {
          .terminal-window {
            height: 85vh;
          }
          .terminal-body {
            font-size: 12px;
            padding: 12px;
          }
          .suggestions {
            max-width: 100%;
          }
        }
      `}</style>
    </div>
  )
}
