import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { createEmptyMineBoard, revealMineCells, seedMineBoard } from '../../lib/minesweeperGame'
import './ArcadeMinesweeper.css'

const SIZE = 10
const MINE_COUNT = 14
const CELLS_PER_UNLOCK = 8
const LONG_PRESS_DELAY = 480

function getCellLabel(cell, flagMode) {
  const row = Math.floor(cell.index / SIZE) + 1
  const column = (cell.index % SIZE) + 1
  const position = `Row ${row}, column ${column}`

  if (cell.open && cell.mine) return `${position}, mine`
  if (cell.open) return `${position}, ${cell.nearby ? `${cell.nearby} nearby mines` : 'empty'}`
  if (cell.flagged) return `${position}, flagged. ${flagMode ? 'Press Enter or F' : 'Press F'} to remove the flag`
  return `${position}, closed. ${flagMode ? 'Press Enter to flag' : 'Press Enter to open'}`
}

export default function ArcadeMinesweeper({ onUnlock, onSessionStart, onGameEnd }) {
  const [board, setBoard] = useState(() => createEmptyMineBoard(SIZE))
  const [status, setStatus] = useState('ready')
  const [flagMode, setFlagMode] = useState(false)
  const [showGuide, setShowGuide] = useState(true)
  const [activeCell, setActiveCell] = useState(0)
  const boardRef = useRef(null)
  const milestoneRef = useRef(0)
  const sessionStartedRef = useRef(false)
  const endTimerRef = useRef(0)
  const longPressTimerRef = useRef(0)
  const suppressionTimerRef = useRef(0)
  const pressOriginRef = useRef(null)
  const suppressClickRef = useRef(false)
  const helpId = useId()
  const guideTitleId = useId()
  const guideCopyId = useId()

  const flags = useMemo(() => board.filter((cell) => cell.flagged).length, [board])
  const gameEnded = status === 'lost' || status === 'won'
  const guideOpen = showGuide && status === 'ready'

  useEffect(() => () => {
    window.clearTimeout(endTimerRef.current)
    window.clearTimeout(longPressTimerRef.current)
    window.clearTimeout(suppressionTimerRef.current)
  }, [])

  const clearLongPress = () => {
    window.clearTimeout(longPressTimerRef.current)
    longPressTimerRef.current = 0
    pressOriginRef.current = null
  }

  const resetClickSuppression = (delay = 350) => {
    window.clearTimeout(suppressionTimerRef.current)
    suppressionTimerRef.current = window.setTimeout(() => {
      suppressClickRef.current = false
    }, delay)
  }

  const reset = () => {
    window.clearTimeout(endTimerRef.current)
    window.clearTimeout(suppressionTimerRef.current)
    clearLongPress()
    suppressClickRef.current = false
    setBoard(createEmptyMineBoard(SIZE))
    setStatus('ready')
    setFlagMode(false)
    setShowGuide(true)
    setActiveCell(0)
    milestoneRef.current = 0
    sessionStartedRef.current = false
  }

  const processMilestones = (safeCount) => {
    const milestone = Math.floor(safeCount / CELLS_PER_UNLOCK)
    while (milestoneRef.current < milestone) {
      onUnlock()
      milestoneRef.current += 1
    }
  }

  const toggleFlagAt = (cellIndex) => {
    if (gameEnded) return
    setBoard((current) => current.map((cell) => (
      cell.index === cellIndex && !cell.open ? { ...cell, flagged: !cell.flagged } : cell
    )))
  }

  const openCell = (cellIndex) => {
    if (gameEnded || board[cellIndex].flagged || board[cellIndex].open) return

    let workingBoard = board
    if (status === 'ready') {
      if (!sessionStartedRef.current) {
        sessionStartedRef.current = true
        onSessionStart()
      }
      const seededBoard = seedMineBoard(SIZE, MINE_COUNT, cellIndex)
      workingBoard = seededBoard.map((cell) => board[cell.index].flagged ? { ...cell, flagged: true } : cell)
      setStatus('playing')
      setShowGuide(false)
    }

    const cell = workingBoard[cellIndex]
    if (cell.mine) {
      setBoard(workingBoard.map((item) => item.mine ? { ...item, open: true } : item))
      setStatus('lost')
      const safeCount = workingBoard.filter((item) => item.open && !item.mine).length
      endTimerRef.current = window.setTimeout(() => onGameEnd({ game: 'minesweeper', score: safeCount, metricLabel: 'Safe cells', completed: false }), 750)
      return
    }

    const nextBoard = revealMineCells(workingBoard, cellIndex, SIZE)
    const safeCount = nextBoard.filter((item) => item.open && !item.mine).length
    processMilestones(safeCount)
    const won = safeCount === SIZE * SIZE - MINE_COUNT
    if (won) {
      setStatus('won')
      endTimerRef.current = window.setTimeout(() => onGameEnd({ game: 'minesweeper', score: safeCount, metricLabel: 'Safe cells', completed: true }), 750)
    }
    setBoard(nextBoard)
  }

  const activateCell = (cellIndex) => {
    if (suppressClickRef.current) {
      suppressClickRef.current = false
      window.clearTimeout(suppressionTimerRef.current)
      return
    }
    if (flagMode) toggleFlagAt(cellIndex)
    else openCell(cellIndex)
  }

  const handleContextMenu = (event, cellIndex) => {
    event.preventDefault()
    clearLongPress()
    if (suppressClickRef.current) return
    toggleFlagAt(cellIndex)

    const touchContextMenu = event.nativeEvent.pointerType
      ? event.nativeEvent.pointerType !== 'mouse'
      : event.nativeEvent.sourceCapabilities?.firesTouchEvents
    if (touchContextMenu) {
      suppressClickRef.current = true
      resetClickSuppression(500)
    }
  }

  const startLongPress = (event, cellIndex) => {
    if (event.pointerType === 'mouse' || gameEnded || board[cellIndex].open) return
    clearLongPress()
    pressOriginRef.current = { x: event.clientX, y: event.clientY, pointerId: event.pointerId }
    longPressTimerRef.current = window.setTimeout(() => {
      suppressClickRef.current = true
      toggleFlagAt(cellIndex)
      navigator.vibrate?.(18)
    }, LONG_PRESS_DELAY)
  }

  const moveLongPress = (event) => {
    const origin = pressOriginRef.current
    if (!origin || origin.pointerId !== event.pointerId) return
    if (Math.hypot(event.clientX - origin.x, event.clientY - origin.y) > 12) clearLongPress()
  }

  const endLongPress = () => {
    clearLongPress()
    if (suppressClickRef.current) resetClickSuppression()
  }

  const focusCell = (cellIndex) => {
    setActiveCell(cellIndex)
    boardRef.current?.querySelector(`[data-cell-index="${cellIndex}"]`)?.focus()
  }

  const handleCellKeyDown = (event, cellIndex) => {
    const rowStart = Math.floor(cellIndex / SIZE) * SIZE
    let nextCell = null

    switch (event.key) {
      case 'ArrowLeft':
        nextCell = cellIndex % SIZE ? cellIndex - 1 : cellIndex
        break
      case 'ArrowRight':
        nextCell = cellIndex % SIZE < SIZE - 1 ? cellIndex + 1 : cellIndex
        break
      case 'ArrowUp':
        nextCell = cellIndex >= SIZE ? cellIndex - SIZE : cellIndex
        break
      case 'ArrowDown':
        nextCell = cellIndex < SIZE * (SIZE - 1) ? cellIndex + SIZE : cellIndex
        break
      case 'Home':
        nextCell = event.ctrlKey ? 0 : rowStart
        break
      case 'End':
        nextCell = event.ctrlKey ? SIZE * SIZE - 1 : rowStart + SIZE - 1
        break
      default:
        break
    }

    if (nextCell !== null) {
      event.preventDefault()
      focusCell(nextCell)
      return
    }

    if (event.key.toLowerCase() === 'f') {
      event.preventDefault()
      toggleFlagAt(cellIndex)
    } else if (event.key.toLowerCase() === 'o') {
      event.preventDefault()
      openCell(cellIndex)
    }
  }

  const dismissGuide = () => {
    setShowGuide(false)
    window.requestAnimationFrame(() => focusCell(activeCell))
  }

  return (
    <section className="arcade-mines">
      <header className="mines-status">
        <div className="mines-counter" aria-label={`${Math.max(0, MINE_COUNT - flags)} mines unmarked`}>
          <span>Mines</span><strong>{String(Math.max(0, MINE_COUNT - flags)).padStart(2, '0')}</strong>
        </div>
        <button type="button" className="mines-reset" onClick={reset} aria-label="Restart Minesweeper" title="Restart Minesweeper"><i className={status} aria-hidden="true" /></button>
        <div className="mines-toolbar" role="group" aria-label="Cell action mode">
          <button type="button" className={!flagMode ? 'active' : ''} data-label="Open" onClick={() => setFlagMode(false)} aria-label="Open mode" aria-pressed={!flagMode} title="Open cells">⛏️</button>
          <button type="button" className={flagMode ? 'active' : ''} data-label="Flag" onClick={() => setFlagMode(true)} aria-label="Flag mode" aria-pressed={flagMode} title="Place flags">🚩</button>
        </div>
      </header>

      <div className="mines-stage">
        <p id={helpId} className="mines-sr-only">Use arrow keys to move across the board. Press Enter or Space to use the selected mode, O to open, or F to toggle a flag.</p>
        <div className="mines-board-shell">
          <div
            ref={boardRef}
            className={`mines-board ${status} ${flagMode ? 'mode-flag' : 'mode-open'} ${guideOpen ? 'guided' : ''}`}
            role="grid"
            aria-label={`Minesweeper board. ${flagMode ? 'Flag' : 'Open'} mode`}
            aria-describedby={helpId}
            aria-rowcount={SIZE}
            aria-colcount={SIZE}
            aria-hidden={guideOpen}
          >
            {board.map((cell) => (
              <button
                type="button"
                role="gridcell"
                key={cell.index}
                data-cell-index={cell.index}
                className={`${cell.open ? 'open' : ''} ${cell.flagged ? 'flagged' : ''} number-${cell.nearby}`}
                onClick={() => activateCell(cell.index)}
                onContextMenu={(event) => handleContextMenu(event, cell.index)}
                onPointerDown={(event) => startLongPress(event, cell.index)}
                onPointerMove={moveLongPress}
                onPointerUp={endLongPress}
                onPointerCancel={endLongPress}
                onFocus={() => setActiveCell(cell.index)}
                onKeyDown={(event) => handleCellKeyDown(event, cell.index)}
                tabIndex={!guideOpen && activeCell === cell.index ? 0 : -1}
                aria-label={getCellLabel(cell, flagMode)}
                aria-keyshortcuts="O F"
                aria-rowindex={Math.floor(cell.index / SIZE) + 1}
                aria-colindex={(cell.index % SIZE) + 1}
                aria-disabled={gameEnded || cell.open}
              >
                {cell.open ? cell.mine ? <i className="mine-icon" aria-hidden="true" /> : cell.nearby || '' : cell.flagged ? <i className="flag-icon" aria-hidden="true" /> : ''}
              </button>
            ))}
          </div>

          {guideOpen ? (
            <section className="mines-guide" aria-labelledby={guideTitleId} aria-describedby={guideCopyId}>
              <div className="mines-guide-card">
                <p className="mines-guide-kicker">How to play</p>
                <h2 id={guideTitleId}>Open safe cells. Flag mines.</h2>
                <div className="mines-guide-actions" id={guideCopyId}>
                  <div><span aria-hidden="true">⛏️</span><p><strong>Open</strong><small>Click, tap, or press Enter</small></p></div>
                  <div><span aria-hidden="true">🚩</span><p><strong>Flag</strong><small>Right-click, long-press, or use Flag mode</small></p></div>
                </div>
                <button type="button" onClick={dismissGuide}>Start <span aria-hidden="true">→</span></button>
              </div>
            </section>
          ) : null}

          {gameEnded ? (
            <div className={`mines-result ${status}`} role="status">
              {status === 'won' ? 'Cleared' : 'Mine hit'}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  )
}
