import { useEffect, useMemo, useRef, useState } from 'react'
import { createEmptyMineBoard, revealMineCells, seedMineBoard } from '../../lib/minesweeperGame'
import './ArcadeMinesweeper.css'

const SIZE = 10
const MINE_COUNT = 14
const CELLS_PER_UNLOCK = 8
const BEST_TIME_KEY = 'portfolio-minesweeper-best-time'

export default function ArcadeMinesweeper({ onUnlock, onSessionStart, onGameEnd }) {
  const [board, setBoard] = useState(() => createEmptyMineBoard(SIZE))
  const [status, setStatus] = useState('ready')
  const [seconds, setSeconds] = useState(0)
  const [bestTime, setBestTime] = useState(() => Number(localStorage.getItem(BEST_TIME_KEY) || 0))
  const [flagMode, setFlagMode] = useState(false)
  const milestoneRef = useRef(0)
  const sessionStartedRef = useRef(false)
  const endTimerRef = useRef(0)

  const openedSafe = useMemo(() => board.filter((cell) => cell.open && !cell.mine).length, [board])
  const flags = useMemo(() => board.filter((cell) => cell.flagged).length, [board])

  useEffect(() => {
    if (status !== 'playing') return undefined
    const timer = window.setInterval(() => setSeconds((value) => value + 1), 1000)
    return () => window.clearInterval(timer)
  }, [status])

  useEffect(() => () => window.clearTimeout(endTimerRef.current), [])

  const reset = () => {
    window.clearTimeout(endTimerRef.current)
    setBoard(createEmptyMineBoard(SIZE))
    setStatus('ready')
    setSeconds(0)
    setFlagMode(false)
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

  const reveal = (cellIndex) => {
    if (status === 'lost' || status === 'won') return
    if (flagMode) {
      setBoard((current) => current.map((cell) => cell.index === cellIndex && !cell.open ? { ...cell, flagged: !cell.flagged } : cell))
      return
    }

    let workingBoard = board
    if (status === 'ready') {
      if (!sessionStartedRef.current) {
        sessionStartedRef.current = true
        onSessionStart()
      }
      workingBoard = seedMineBoard(SIZE, MINE_COUNT, cellIndex)
      setStatus('playing')
    }
    const cell = workingBoard[cellIndex]
    if (cell.flagged || cell.open) return
    if (cell.mine) {
      setBoard(workingBoard.map((item) => item.mine ? { ...item, open: true } : item))
      setStatus('lost')
      const safeCount = workingBoard.filter((item) => item.open && !item.mine).length
      endTimerRef.current = window.setTimeout(() => onGameEnd({ game: 'minesweeper', score: safeCount, metricLabel: 'Safe cells' }), 750)
      return
    }

    const nextBoard = revealMineCells(workingBoard, cellIndex, SIZE)
    const safeCount = nextBoard.filter((item) => item.open && !item.mine).length
    processMilestones(safeCount)
    const won = safeCount === SIZE * SIZE - MINE_COUNT
    if (won) {
      setStatus('won')
      setBestTime((currentBest) => {
        const nextBest = currentBest === 0 ? seconds : Math.min(currentBest, seconds)
        localStorage.setItem(BEST_TIME_KEY, String(nextBest))
        return nextBest
      })
      endTimerRef.current = window.setTimeout(() => onGameEnd({ game: 'minesweeper', score: safeCount, metricLabel: 'Safe cells' }), 750)
    }
    setBoard(nextBoard)
  }

  const toggleFlag = (event, index) => {
    event.preventDefault()
    if (status === 'lost' || status === 'won') return
    setBoard((current) => current.map((cell) => cell.index === index && !cell.open ? { ...cell, flagged: !cell.flagged } : cell))
  }

  return (
    <section className="arcade-mines">
      <header className="mines-status">
        <div><span>Mines</span><strong>{String(Math.max(0, MINE_COUNT - flags)).padStart(2, '0')}</strong></div>
        <button type="button" onClick={reset} aria-label="Restart Minesweeper"><i className={status} /></button>
        <div><span>Time</span><strong>{String(Math.min(seconds, 999)).padStart(3, '0')}</strong></div>
      </header>

      <div className="mines-stage">
        <div className="mines-toolbar">
          <button type="button" className={!flagMode ? 'active' : ''} onClick={() => setFlagMode(false)}>Open</button>
          <button type="button" className={flagMode ? 'active' : ''} onClick={() => setFlagMode(true)}>Flag</button>
          <span>{openedSafe}/{SIZE * SIZE - MINE_COUNT} safe</span>
        </div>
        <div className={`mines-board ${status}`} role="grid" aria-label="Minesweeper board">
          {board.map((cell) => (
            <button
              type="button"
              role="gridcell"
              key={cell.index}
              className={`${cell.open ? 'open' : ''} ${cell.flagged ? 'flagged' : ''} number-${cell.nearby}`}
              onClick={() => reveal(cell.index)}
              onContextMenu={(event) => toggleFlag(event, cell.index)}
              aria-label={cell.open ? cell.mine ? 'Mine' : cell.nearby ? `${cell.nearby} nearby mines` : 'Empty' : cell.flagged ? 'Flagged cell' : 'Closed cell'}
            >
              {cell.open ? cell.mine ? <i className="mine-icon" /> : cell.nearby || '' : cell.flagged ? <i className="flag-icon" /> : ''}
            </button>
          ))}
        </div>
        <footer className="mines-footer">
          <span>{status === 'won' ? 'Field cleared' : status === 'lost' ? 'Mine hit' : 'Open safe cells to unlock records'}</span>
          <span>Best {bestTime ? `${bestTime}s` : '--'}</span>
        </footer>
      </div>
    </section>
  )
}
