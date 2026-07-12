import { useCallback, useEffect, useRef, useState } from 'react'
import { SNAKE_DIRECTIONS, stepSnake } from '../../lib/snakeGame'
import './ArcadeSnake.css'

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

function roundedCell(context, x, y, cell, color) {
  const inset = Math.max(1, cell * 0.07)
  const size = cell - inset * 2
  context.fillStyle = color
  context.beginPath()
  context.roundRect(x * cell + inset, y * cell + inset, size, size, Math.min(cell * 0.24, size / 2))
  context.fill()
}

export default function ArcadeSnake({ onUnlock, onSessionStart, onGameEnd }) {
  const [score, setScore] = useState(0)
  const [bestScore, setBestScore] = useState(() => Number(localStorage.getItem(BEST_SCORE_KEY) || 0))
  const [running, setRunning] = useState(false)
  const [paused, setPaused] = useState(false)
  const [gameOver, setGameOver] = useState(false)
  const [canvasSize, setCanvasSize] = useState(520)
  const canvasRef = useRef(null)
  const boardRef = useRef(null)
  const snakeRef = useRef(INITIAL_SNAKE)
  const previousSnakeRef = useRef(INITIAL_SNAKE)
  const fruitRef = useRef(createFruit(INITIAL_SNAKE))
  const scoreRef = useRef(0)
  const runningRef = useRef(false)
  const pausedRef = useRef(false)
  const directionRef = useRef('right')
  const committedDirectionRef = useRef('right')
  const turnQueuedRef = useRef(false)
  const swipeStartRef = useRef(null)
  const wakeAnimationRef = useRef(null)
  const audioContextRef = useRef(null)
  const endTimerRef = useRef(0)

  const ensureAudio = useCallback(() => {
    if (!audioContextRef.current) {
      const AudioContext = window.AudioContext || window.webkitAudioContext
      if (AudioContext) audioContextRef.current = new AudioContext()
    }
    if (audioContextRef.current?.state === 'suspended') audioContextRef.current.resume()
    return audioContextRef.current
  }, [])

  const playTone = useCallback((frequencies, duration = .08, volume = .045) => {
    const audio = ensureAudio()
    if (!audio) return
    frequencies.forEach((frequency, index) => {
      const oscillator = audio.createOscillator()
      const gain = audio.createGain()
      const startsAt = audio.currentTime + index * .045
      oscillator.type = index ? 'sine' : 'triangle'
      oscillator.frequency.setValueAtTime(frequency, startsAt)
      gain.gain.setValueAtTime(volume, startsAt)
      gain.gain.exponentialRampToValueAtTime(.0001, startsAt + duration)
      oscillator.connect(gain).connect(audio.destination)
      oscillator.start(startsAt)
      oscillator.stop(startsAt + duration)
    })
  }, [ensureAudio])

  const playEatFeedback = useCallback((isNew) => {
    playTone(isNew ? [440, 660, 880] : [420, 620], isNew ? .13 : .08, isNew ? .055 : .04)
    boardRef.current?.animate(
      isNew
        ? [{ transform: 'translate3d(0,0,0) scale(1)' }, { transform: 'translate3d(-5px,2px,0) scale(1.012)' }, { transform: 'translate3d(4px,-2px,0) scale(1.012)' }, { transform: 'translate3d(0,0,0) scale(1)' }]
        : [{ transform: 'translateX(0)' }, { transform: 'translateX(-3px)' }, { transform: 'translateX(3px)' }, { transform: 'translateX(0)' }],
      { duration: isNew ? 260 : 150, easing: 'ease-out' }
    )
  }, [playTone])

  const setPausedState = useCallback((next) => {
    pausedRef.current = next
    setPaused(next)
    if (!next) wakeAnimationRef.current?.()
  }, [])

  const startGame = useCallback(() => {
    window.clearTimeout(endTimerRef.current)
    ensureAudio()
    onSessionStart()
    const snake = INITIAL_SNAKE.map((cell) => ({ ...cell }))
    snakeRef.current = snake
    previousSnakeRef.current = snake
    fruitRef.current = createFruit(snake)
    scoreRef.current = 0
    directionRef.current = 'right'
    committedDirectionRef.current = 'right'
    turnQueuedRef.current = false
    runningRef.current = true
    pausedRef.current = false
    setScore(0)
    setRunning(true)
    setPaused(false)
    setGameOver(false)
    wakeAnimationRef.current?.()
  }, [ensureAudio, onSessionStart])

  const setDirection = useCallback((next) => {
    if (!SNAKE_DIRECTIONS[next] || turnQueuedRef.current || OPPOSITE[committedDirectionRef.current] === next) return
    directionRef.current = next
    turnQueuedRef.current = true
  }, [])

  const directSnake = useCallback((next) => {
    if (!runningRef.current) startGame()
    setDirection(next)
  }, [setDirection, startGame])

  useEffect(() => {
    const board = boardRef.current
    if (!board) return undefined
    const resize = () => setCanvasSize(Math.max(220, Math.floor(Math.min(board.clientWidth, board.clientHeight))))
    resize()
    const observer = new ResizeObserver(resize)
    observer.observe(board)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return undefined
    const pixelRatio = Math.min(window.devicePixelRatio || 1, window.innerWidth < 700 ? 1.25 : 1.5)
    canvas.width = Math.round(canvasSize * pixelRatio)
    canvas.height = Math.round(canvasSize * pixelRatio)
    canvas.style.width = `${canvasSize}px`
    canvas.style.height = `${canvasSize}px`
    const context = canvas.getContext('2d')
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0)
    let animationFrame = 0
    let alive = true
    let lastStepAt = performance.now()

    const draw = (progress) => {
      context.clearRect(0, 0, canvasSize, canvasSize)
      const cell = canvasSize / GRID_SIZE
      const current = snakeRef.current
      const previous = previousSnakeRef.current

      for (let index = current.length - 1; index >= 0; index -= 1) {
        const from = previous[index] || previous.at(-1) || current[index]
        const to = current[index]
        const x = from.x + (to.x - from.x) * progress
        const y = from.y + (to.y - from.y) * progress
        roundedCell(context, x, y, cell, index === 0 ? '#4169e1' : '#4d78e8')
      }

      const head = current[0]
      const previousHead = previous[0] || head
      if (head) {
        const x = previousHead.x + (head.x - previousHead.x) * progress
        const y = previousHead.y + (head.y - previousHead.y) * progress
        const centerX = (x + 0.5) * cell
        const centerY = (y + 0.5) * cell
        const offset = cell * 0.2
        const radius = Math.max(1.1, cell * 0.065)
        const direction = committedDirectionRef.current
        const eyes = direction === 'left' || direction === 'right'
          ? [[centerX + (direction === 'right' ? offset : -offset), centerY - offset], [centerX + (direction === 'right' ? offset : -offset), centerY + offset]]
          : [[centerX - offset, centerY + (direction === 'down' ? offset : -offset)], [centerX + offset, centerY + (direction === 'down' ? offset : -offset)]]
        context.fillStyle = '#fff'
        eyes.forEach(([eyeX, eyeY]) => { context.beginPath(); context.arc(eyeX, eyeY, radius, 0, Math.PI * 2); context.fill() })
      }

      const fruit = fruitRef.current
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
    }

    const requestFrame = () => {
      if (alive && !animationFrame) animationFrame = requestAnimationFrame(frame)
    }

    const frame = (now) => {
      animationFrame = 0
      const active = runningRef.current && !pausedRef.current
      const stepDuration = Math.max(68, 132 - Math.floor(scoreRef.current / 3) * 5)
      if (active) {
        if (now - lastStepAt >= stepDuration) {
          previousSnakeRef.current = snakeRef.current.map((cell) => ({ ...cell }))
          const result = stepSnake(snakeRef.current, directionRef.current, fruitRef.current, GRID_SIZE)
          committedDirectionRef.current = directionRef.current
          turnQueuedRef.current = false
          lastStepAt = now
          if (result.collision) {
            runningRef.current = false
            setRunning(false)
            setGameOver(true)
            playTone([180, 120], .16, .035)
            boardRef.current?.animate(
              [{ transform: 'translateX(0)' }, { transform: 'translateX(-7px)' }, { transform: 'translateX(7px)' }, { transform: 'translateX(-3px)' }, { transform: 'translateX(0)' }],
              { duration: 320, easing: 'ease-out' }
            )
            endTimerRef.current = window.setTimeout(() => onGameEnd({ game: 'snake', score: scoreRef.current, metricLabel: 'Apples' }), 700)
          } else {
            snakeRef.current = result.snake
            if (result.ateFruit) {
              scoreRef.current += 1
              const nextScore = scoreRef.current
              setScore(nextScore)
              fruitRef.current = createFruit(result.snake)
              setBestScore((currentBest) => {
                const nextBest = Math.max(currentBest, nextScore)
                localStorage.setItem(BEST_SCORE_KEY, String(nextBest))
                return nextBest
              })
              const unlock = onUnlock(nextScore - 1)
              playEatFeedback(unlock?.isNew)
            }
          }
        }
        draw(Math.min(1, (now - lastStepAt) / stepDuration))
        if (runningRef.current && !pausedRef.current) requestFrame()
      } else {
        lastStepAt = now
        draw(1)
      }
    }

    wakeAnimationRef.current = requestFrame
    requestFrame()
    return () => {
      alive = false
      wakeAnimationRef.current = null
      cancelAnimationFrame(animationFrame)
    }
  }, [canvasSize, onGameEnd, onUnlock, playEatFeedback, playTone])

  useEffect(() => () => {
    window.clearTimeout(endTimerRef.current)
    audioContextRef.current?.close()
  }, [])

  useEffect(() => {
    const handleKeyDown = (event) => {
      const keys = { ArrowUp: 'up', w: 'up', W: 'up', ArrowDown: 'down', s: 'down', S: 'down', ArrowLeft: 'left', a: 'left', A: 'left', ArrowRight: 'right', d: 'right', D: 'right' }
      if (keys[event.key]) {
        event.preventDefault()
        directSnake(keys[event.key])
      } else if (event.code === 'Space') {
        event.preventDefault()
        if (!runningRef.current) startGame()
        else setPausedState(!pausedRef.current)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [directSnake, setPausedState, startGame])

  useEffect(() => {
    const pauseHidden = () => {
      if (document.hidden && runningRef.current) setPausedState(true)
    }
    document.addEventListener('visibilitychange', pauseHidden)
    return () => document.removeEventListener('visibilitychange', pauseHidden)
  }, [setPausedState])

  const handlePointerDown = (event) => { swipeStartRef.current = { x: event.clientX, y: event.clientY } }
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
    <section className="arcade-snake">
      <div className="arcade-snake-stage">
        <button className="arcade-game-pause" type="button" onClick={() => running ? setPausedState(!paused) : startGame()}>{running ? paused ? 'Resume' : 'Pause' : 'Start'}</button>
        <div className="arcade-snake-board" ref={boardRef} onPointerDown={handlePointerDown} onPointerUp={handlePointerUp}>
          <canvas ref={canvasRef} aria-label={`Snake board. Score ${score}. Best ${bestScore}.`} />
          {(!running || paused) && (
            <div className="arcade-game-overlay">
              <strong>{gameOver ? 'Discovered' : paused ? 'Paused' : 'Snake'}</strong>
              {!gameOver && !paused ? <span>1 apple = 1 record</span> : null}
              {!gameOver ? <button type="button" onClick={!running ? startGame : () => setPausedState(false)}>{paused ? 'Continue' : 'Play'}</button> : null}
            </div>
          )}
        </div>
        <div className="arcade-dpad" aria-label="Snake controls">
          <button type="button" className="up" onClick={() => directSnake('up')} aria-label="Move up">↑</button>
          <button type="button" className="left" onClick={() => directSnake('left')} aria-label="Move left">←</button>
          <button type="button" className="down" onClick={() => directSnake('down')} aria-label="Move down">↓</button>
          <button type="button" className="right" onClick={() => directSnake('right')} aria-label="Move right">→</button>
        </div>
      </div>
    </section>
  )
}
