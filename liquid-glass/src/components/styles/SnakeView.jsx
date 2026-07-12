import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import StyleSwitcher from '../StyleSwitcher'
import { getAllItems, profile, SECTION_META } from '../../lib/profileData'
import { SNAKE_DIRECTIONS, stepSnake } from '../../lib/snakeGame'
import './SnakeView.css'

const GRID_SIZE = 20
const BEST_SCORE_KEY = 'portfolio-snake-best-score'
const INITIAL_SNAKE = [{ x: 8, y: 10 }, { x: 7, y: 10 }, { x: 6, y: 10 }]
const OPPOSITE = { up: 'down', down: 'up', left: 'right', right: 'left' }

function createFruit(snake) {
  const occupied = new Set(snake.map(({ x, y }) => `${x}:${y}`))
  const available = []
  for (let y = 0; y < GRID_SIZE; y += 1) {
    for (let x = 0; x < GRID_SIZE; x += 1) {
      if (!occupied.has(`${x}:${y}`)) available.push({ x, y })
    }
  }
  return available[Math.floor(Math.random() * available.length)] || { x: 15, y: 10 }
}

function sectionLabel(section) {
  return SECTION_META.find((entry) => entry.id === section)?.label || 'Profile'
}

function drawRoundedCell(context, x, y, size, radius, color) {
  const inset = Math.max(1, size * 0.07)
  const left = x * size + inset
  const top = y * size + inset
  const width = size - inset * 2
  context.fillStyle = color
  context.beginPath()
  context.roundRect(left, top, width, width, Math.min(radius, width / 2))
  context.fill()
}

export default function SnakeView() {
  const facts = useMemo(() => [
    { id: 'profile-intro', section: 'profile', title: profile.title, subtitle: profile.location, description: profile.about },
    ...getAllItems(false)
  ], [])
  const [snake, setSnake] = useState(INITIAL_SNAKE)
  const [fruit, setFruit] = useState(() => createFruit(INITIAL_SNAKE))
  const [score, setScore] = useState(0)
  const [bestScore, setBestScore] = useState(() => Number(localStorage.getItem(BEST_SCORE_KEY) || 0))
  const [running, setRunning] = useState(false)
  const [paused, setPaused] = useState(false)
  const [gameOver, setGameOver] = useState(false)
  const [latestFact, setLatestFact] = useState(null)
  const [discoveries, setDiscoveries] = useState([])
  const [canvasSize, setCanvasSize] = useState(560)
  const canvasRef = useRef(null)
  const boardRef = useRef(null)
  const directionRef = useRef('right')
  const committedDirectionRef = useRef('right')
  const turnQueuedRef = useRef(false)
  const swipeStartRef = useRef(null)

  const setDirection = useCallback((next) => {
    if (!SNAKE_DIRECTIONS[next] || turnQueuedRef.current || OPPOSITE[committedDirectionRef.current] === next) return
    directionRef.current = next
    turnQueuedRef.current = true
  }, [])

  const startGame = useCallback(() => {
    const initial = INITIAL_SNAKE.map((cell) => ({ ...cell }))
    directionRef.current = 'right'
    committedDirectionRef.current = 'right'
    turnQueuedRef.current = false
    setSnake(initial)
    setFruit(createFruit(initial))
    setScore(0)
    setLatestFact(null)
    setDiscoveries([])
    setGameOver(false)
    setPaused(false)
    setRunning(true)
  }, [])

  const directSnake = useCallback((next) => {
    if (!running || gameOver) startGame()
    setDirection(next)
  }, [gameOver, running, setDirection, startGame])

  useEffect(() => {
    const board = boardRef.current
    if (!board) return undefined
    const resize = () => setCanvasSize(Math.floor(Math.min(board.clientWidth, board.clientHeight)))
    resize()
    const observer = new ResizeObserver(resize)
    observer.observe(board)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const handleKeyDown = (event) => {
      const directionKeys = {
        ArrowUp: 'up', w: 'up', W: 'up',
        ArrowDown: 'down', s: 'down', S: 'down',
        ArrowLeft: 'left', a: 'left', A: 'left',
        ArrowRight: 'right', d: 'right', D: 'right'
      }
      if (directionKeys[event.key]) {
        event.preventDefault()
        if (!running || gameOver) startGame()
        setDirection(directionKeys[event.key])
      } else if (event.code === 'Space') {
        event.preventDefault()
        if (!running || gameOver) startGame()
        else setPaused((value) => !value)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [gameOver, running, setDirection, startGame])

  useEffect(() => {
    const pauseWhenHidden = () => {
      if (document.hidden && running) setPaused(true)
    }
    document.addEventListener('visibilitychange', pauseWhenHidden)
    return () => document.removeEventListener('visibilitychange', pauseWhenHidden)
  }, [running])

  useEffect(() => {
    if (!running || paused || gameOver) return undefined
    const speed = Math.max(68, 132 - Math.floor(score / 3) * 5)
    const timer = window.setInterval(() => {
      setSnake((current) => {
        committedDirectionRef.current = directionRef.current
        turnQueuedRef.current = false
        const result = stepSnake(current, directionRef.current, fruit, GRID_SIZE)
        if (result.collision) {
          setRunning(false)
          setGameOver(true)
          return current
        }

        if (result.ateFruit) {
          setScore((currentScore) => {
            const nextScore = currentScore + 1
            const fact = facts[(nextScore - 1) % facts.length]
            setLatestFact(fact)
            setDiscoveries((currentFacts) => [...currentFacts, fact])
            setBestScore((currentBest) => {
              const nextBest = Math.max(currentBest, nextScore)
              localStorage.setItem(BEST_SCORE_KEY, String(nextBest))
              return nextBest
            })
            return nextScore
          })
          setFruit(createFruit(result.snake))
        }
        return result.snake
      })
    }, speed)
    return () => window.clearInterval(timer)
  }, [facts, fruit, gameOver, paused, running, score])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2)
    canvas.width = canvasSize * pixelRatio
    canvas.height = canvasSize * pixelRatio
    canvas.style.width = `${canvasSize}px`
    canvas.style.height = `${canvasSize}px`
    const context = canvas.getContext('2d')
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0)
    const cell = canvasSize / GRID_SIZE

    context.fillStyle = '#aad751'
    context.fillRect(0, 0, canvasSize, canvasSize)
    context.fillStyle = '#a2d149'
    for (let y = 0; y < GRID_SIZE; y += 1) {
      for (let x = 0; x < GRID_SIZE; x += 1) {
        if ((x + y) % 2) context.fillRect(x * cell, y * cell, cell, cell)
      }
    }

    snake.slice().reverse().forEach((part, reverseIndex) => {
      const index = snake.length - 1 - reverseIndex
      drawRoundedCell(context, part.x, part.y, cell, cell * 0.24, index === 0 ? '#4169e1' : '#4d78e8')
    })

    const head = snake[0]
    if (head) {
      const eyeOffset = cell * 0.2
      const eyeRadius = Math.max(1.2, cell * 0.07)
      const centerX = (head.x + 0.5) * cell
      const centerY = (head.y + 0.5) * cell
      const direction = committedDirectionRef.current
      const eyePositions = direction === 'left' || direction === 'right'
        ? [[centerX + (direction === 'right' ? eyeOffset : -eyeOffset), centerY - eyeOffset], [centerX + (direction === 'right' ? eyeOffset : -eyeOffset), centerY + eyeOffset]]
        : [[centerX - eyeOffset, centerY + (direction === 'down' ? eyeOffset : -eyeOffset)], [centerX + eyeOffset, centerY + (direction === 'down' ? eyeOffset : -eyeOffset)]]
      context.fillStyle = '#fff'
      eyePositions.forEach(([x, y]) => { context.beginPath(); context.arc(x, y, eyeRadius, 0, Math.PI * 2); context.fill() })
    }

    const fruitX = (fruit.x + 0.5) * cell
    const fruitY = (fruit.y + 0.54) * cell
    context.fillStyle = '#e7473c'
    context.beginPath()
    context.arc(fruitX, fruitY, cell * 0.31, 0, Math.PI * 2)
    context.fill()
    context.fillStyle = '#398b42'
    context.beginPath()
    context.ellipse(fruitX + cell * 0.18, fruitY - cell * 0.3, cell * 0.18, cell * 0.09, -0.6, 0, Math.PI * 2)
    context.fill()
  }, [canvasSize, fruit, snake])

  const handlePointerDown = (event) => {
    swipeStartRef.current = { x: event.clientX, y: event.clientY }
  }

  const handlePointerUp = (event) => {
    const start = swipeStartRef.current
    swipeStartRef.current = null
    if (!start) return
    const dx = event.clientX - start.x
    const dy = event.clientY - start.y
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 18) return
    directSnake(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up'))
  }

  return (
    <main className="snake-view">
      <header className="snake-header">
        <div><span className="snake-logo"><i /></span><strong>Taeho Snake</strong></div>
        <div className="snake-score"><span>Score <b>{score}</b></span><span>Best <b>{bestScore}</b></span></div>
        <button type="button" onClick={() => running ? setPaused((value) => !value) : startGame()}>{running ? paused ? 'Resume' : 'Pause' : 'New game'}</button>
      </header>

      <div className="snake-layout">
        <section className="snake-game-column">
          <div className="snake-board" ref={boardRef} onPointerDown={handlePointerDown} onPointerUp={handlePointerUp}>
            <canvas ref={canvasRef} aria-label={`Snake board. Current score ${score}.`} />
            {(!running || paused) && (
              <div className="snake-overlay">
                {gameOver ? <><strong>Game over</strong><span>{score} records unlocked</span></> : paused ? <><strong>Paused</strong><span>Press Space to continue</span></> : <><strong>Play</strong><span>Arrow keys, WASD, or swipe</span></>}
                <button type="button" onClick={gameOver ? startGame : running ? () => setPaused(false) : startGame}>{gameOver ? 'Play again' : paused ? 'Resume' : 'Start game'}</button>
              </div>
            )}
          </div>

          <div className="snake-dpad" aria-label="Snake controls">
            <button type="button" className="up" onClick={() => directSnake('up')} aria-label="Move up">↑</button>
            <button type="button" className="left" onClick={() => directSnake('left')} aria-label="Move left">←</button>
            <button type="button" className="down" onClick={() => directSnake('down')} aria-label="Move down">↓</button>
            <button type="button" className="right" onClick={() => directSnake('right')} aria-label="Move right">→</button>
          </div>
        </section>

        <aside className="snake-discovery">
          <div className="snake-discovery-heading"><span>Eat an apple</span><h1>Unlock my story.</h1><p>Each point reveals one real portfolio record.</p></div>
          <div className={`snake-fact-card ${latestFact ? 'unlocked' : ''}`} key={latestFact?.id || 'empty'}>
            {latestFact ? (
              <>
                <span>{sectionLabel(latestFact.section)}</span>
                <h2>{latestFact.title}</h2>
                {latestFact.subtitle && <h3>{latestFact.subtitle}</h3>}
                {latestFact.description && <p>{latestFact.description}</p>}
                {latestFact.link && <a href={latestFact.link} target="_blank" rel="noopener noreferrer">Open record</a>}
              </>
            ) : (
              <><span>Next apple</span><h2>Your first record is waiting.</h2><p>Start the game and eat the red apple.</p></>
            )}
          </div>
          <div className="snake-progress"><span>{discoveries.length} unlocked</span><i><b style={{ width: `${Math.min(100, (discoveries.length / facts.length) * 100)}%` }} /></i><small>{facts.length} records</small></div>
        </aside>
      </div>
      <StyleSwitcher />
    </main>
  )
}
