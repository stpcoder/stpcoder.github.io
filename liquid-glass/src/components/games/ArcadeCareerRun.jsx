import { useCallback, useEffect, useRef, useState } from 'react'
import {
  createCareerRunner,
  RUN_CHECKPOINTS,
  RUN_FINISH_X,
  RUN_GROUND_Y,
  RUN_OBSTACLES,
  RUN_VIEWPORT,
  RUN_WORLD_WIDTH,
  stepCareerRunner
} from '../../lib/careerRunGame'
import './ArcadeCareerRun.css'

const BEST_KEY = 'portfolio-career-run-best'

function drawRoundedRect(context, x, y, width, height, radius, color) {
  context.fillStyle = color
  context.beginPath()
  context.roundRect(x, y, width, height, radius)
  context.fill()
}

function drawRunner(context, player, camera, time, invincible) {
  if (invincible && Math.floor(time / 80) % 2) return
  const x = player.x - camera
  const y = player.y
  const stride = player.onGround && Math.abs(player.vx) > 20 ? Math.sin(time / 55) * 5 : 0

  context.save()
  context.translate(x + player.w / 2, y)
  if (player.vx < -2) context.scale(-1, 1)
  drawRoundedRect(context, -12, 0, 24, 20, 7, '#f1c39e')
  context.fillStyle = '#172a43'
  context.fillRect(-12, 0, 24, 7)
  context.fillStyle = '#172a43'
  context.fillRect(5, 8, 3, 3)
  drawRoundedRect(context, -14, 19, 28, 22, 5, '#2f69d9')
  context.fillStyle = '#f5e8c6'
  context.fillRect(-2, 20, 4, 20)
  context.fillStyle = '#17385f'
  context.fillRect(-11, 40, 8, 12 + Math.max(0, stride))
  context.fillRect(3, 40, 8, 12 + Math.max(0, -stride))
  context.fillStyle = '#f1c39e'
  context.fillRect(14, 23, 6, 17)
  context.restore()
}

function drawObstacle(context, obstacle, camera) {
  const x = obstacle.x - camera
  const y = RUN_GROUND_Y - obstacle.h
  if (obstacle.type === 'server') {
    drawRoundedRect(context, x, y, obstacle.w, obstacle.h, 5, '#24384a')
    for (let row = 0; row < 3; row += 1) {
      context.fillStyle = '#3f596d'
      context.fillRect(x + 7, y + 9 + row * 18, obstacle.w - 14, 9)
      context.fillStyle = row === 1 ? '#f1b84b' : '#5ed5a0'
      context.fillRect(x + obstacle.w - 15, y + 12 + row * 18, 3, 3)
    }
  } else if (obstacle.type === 'barrier') {
    drawRoundedRect(context, x, y, obstacle.w, obstacle.h, 4, '#e45a42')
    context.fillStyle = '#f6d36a'
    for (let offset = -obstacle.h; offset < obstacle.w; offset += 22) {
      context.save()
      context.beginPath()
      context.rect(x, y, obstacle.w, obstacle.h)
      context.clip()
      context.translate(x + offset, y)
      context.rotate(-.55)
      context.fillRect(0, 0, 10, obstacle.h * 1.7)
      context.restore()
    }
  } else {
    drawRoundedRect(context, x, y, obstacle.w, obstacle.h, 4, '#b67b45')
    context.strokeStyle = '#7c4c2f'
    context.lineWidth = 3
    context.strokeRect(x + 5, y + 5, obstacle.w - 10, obstacle.h - 10)
    context.beginPath()
    context.moveTo(x + 7, y + 7)
    context.lineTo(x + obstacle.w - 7, y + obstacle.h - 7)
    context.moveTo(x + obstacle.w - 7, y + 7)
    context.lineTo(x + 7, y + obstacle.h - 7)
    context.stroke()
  }
}

function drawWorld(context, player, camera, collected, time, invincible) {
  const sky = context.createLinearGradient(0, 0, 0, RUN_VIEWPORT.height)
  sky.addColorStop(0, '#dff3ff')
  sky.addColorStop(.58, '#f7e8c5')
  sky.addColorStop(1, '#d4c193')
  context.fillStyle = sky
  context.fillRect(0, 0, RUN_VIEWPORT.width, RUN_VIEWPORT.height)

  context.fillStyle = 'rgba(255,255,255,.7)'
  context.beginPath()
  context.arc(735 - camera * .03, 92, 42, 0, Math.PI * 2)
  context.fill()

  context.fillStyle = '#9db8bd'
  context.beginPath()
  context.moveTo(0, 300)
  for (let x = -100; x <= RUN_VIEWPORT.width + 100; x += 120) {
    const worldX = x + (camera * .14) % 120
    context.lineTo(worldX, 245 - Math.sin((x + camera * .08) / 140) * 38)
  }
  context.lineTo(RUN_VIEWPORT.width, 410)
  context.lineTo(0, 410)
  context.fill()

  context.fillStyle = '#68828a'
  for (let index = 0; index < 15; index += 1) {
    const x = index * 92 - (camera * .35) % 92
    const height = 55 + (index % 4) * 17
    context.fillRect(x, RUN_GROUND_Y - height, 66, height)
    context.fillStyle = '#bed6d1'
    context.fillRect(x + 10, RUN_GROUND_Y - height + 13, 8, 8)
    context.fillRect(x + 31, RUN_GROUND_Y - height + 13, 8, 8)
    context.fillStyle = '#68828a'
  }

  context.fillStyle = '#4f7f38'
  context.fillRect(0, RUN_GROUND_Y, RUN_VIEWPORT.width, 90)
  context.fillStyle = '#aad751'
  context.fillRect(0, RUN_GROUND_Y, RUN_VIEWPORT.width, 12)
  context.fillStyle = 'rgba(255,255,255,.16)'
  for (let x = -(camera % 80); x < RUN_VIEWPORT.width; x += 80) context.fillRect(x, RUN_GROUND_Y + 34, 42, 4)

  RUN_CHECKPOINTS.forEach((checkpoint, index) => {
    const x = checkpoint.x - camera
    if (x < -70 || x > RUN_VIEWPORT.width + 70) return
    const done = collected.has(index)
    context.strokeStyle = done ? '#397d51' : '#3d6fc7'
    context.lineWidth = 4
    context.beginPath()
    context.arc(x, RUN_GROUND_Y - 92, 22 + Math.sin(time / 220 + index) * 2, 0, Math.PI * 2)
    context.stroke()
    context.fillStyle = done ? '#5ed58e' : '#fff6c7'
    context.beginPath()
    context.arc(x, RUN_GROUND_Y - 92, 13, 0, Math.PI * 2)
    context.fill()
    context.fillStyle = '#334438'
    context.font = '700 10px Avenir Next, sans-serif'
    context.textAlign = 'center'
    context.fillText(done ? 'OK' : String(index + 1).padStart(2, '0'), x, RUN_GROUND_Y - 88)
    context.fillStyle = '#42564b'
    context.font = '700 9px Avenir Next, sans-serif'
    context.fillText(checkpoint.label.toUpperCase(), x, RUN_GROUND_Y - 55)
  })

  RUN_OBSTACLES.forEach((obstacle) => {
    if (obstacle.x + obstacle.w >= camera - 50 && obstacle.x <= camera + RUN_VIEWPORT.width + 50) drawObstacle(context, obstacle, camera)
  })

  const finishX = RUN_FINISH_X - camera
  if (finishX < RUN_VIEWPORT.width + 100) {
    context.fillStyle = '#233549'
    context.fillRect(finishX, 195, 10, RUN_GROUND_Y - 195)
    context.fillStyle = '#f6f0da'
    context.fillRect(finishX + 10, 205, 78, 38)
    context.fillStyle = '#24384a'
    context.font = '800 12px Avenir Next, sans-serif'
    context.textAlign = 'center'
    context.fillText('FINISH', finishX + 49, 229)
  }

  drawRunner(context, player, camera, time, invincible)
}

export default function ArcadeCareerRun({ onUnlock, onSessionStart, onGameEnd }) {
  const [status, setStatus] = useState('ready')
  const [lives, setLives] = useState(3)
  const [progress, setProgress] = useState(0)
  const [best, setBest] = useState(() => Number(localStorage.getItem(BEST_KEY) || 0))
  const [latestStory, setLatestStory] = useState('')
  const [canvasWidth, setCanvasWidth] = useState(760)
  const canvasRef = useRef(null)
  const boardRef = useRef(null)
  const playerRef = useRef(createCareerRunner())
  const controlsRef = useRef({ left: false, right: false })
  const collectedRef = useRef(new Set())
  const statusRef = useRef('ready')
  const cameraRef = useRef(0)
  const invincibleUntilRef = useRef(0)
  const latestProgressRef = useRef(0)
  const animationRef = useRef(0)
  const frameRef = useRef(null)
  const audioRef = useRef(null)
  const endTimerRef = useRef(0)
  const livesRef = useRef(3)

  const ensureAudio = useCallback(() => {
    if (!audioRef.current) {
      const AudioContext = window.AudioContext || window.webkitAudioContext
      if (AudioContext) audioRef.current = new AudioContext()
    }
    if (audioRef.current?.state === 'suspended') audioRef.current.resume()
    return audioRef.current
  }, [])

  const tone = useCallback((frequency, endFrequency, duration = .12) => {
    const audio = ensureAudio()
    if (!audio) return
    const oscillator = audio.createOscillator()
    const gain = audio.createGain()
    oscillator.type = 'square'
    oscillator.frequency.setValueAtTime(frequency, audio.currentTime)
    oscillator.frequency.exponentialRampToValueAtTime(endFrequency, audio.currentTime + duration)
    gain.gain.setValueAtTime(.032, audio.currentTime)
    gain.gain.exponentialRampToValueAtTime(.0001, audio.currentTime + duration)
    oscillator.connect(gain).connect(audio.destination)
    oscillator.start()
    oscillator.stop(audio.currentTime + duration)
  }, [ensureAudio])

  const wake = useCallback(() => {
    if (!animationRef.current && frameRef.current) animationRef.current = requestAnimationFrame(frameRef.current)
  }, [])

  const startGame = useCallback(() => {
    window.clearTimeout(endTimerRef.current)
    ensureAudio()
    onSessionStart()
    playerRef.current = createCareerRunner()
    controlsRef.current = { left: false, right: false }
    collectedRef.current = new Set()
    cameraRef.current = 0
    invincibleUntilRef.current = 0
    latestProgressRef.current = 0
    statusRef.current = 'running'
    setStatus('running')
    livesRef.current = 3
    setLives(3)
    setProgress(0)
    setLatestStory('')
    wake()
  }, [ensureAudio, onSessionStart, wake])

  const endGame = useCallback((completed) => {
    if (statusRef.current === 'ended') return
    statusRef.current = 'ended'
    controlsRef.current = { left: false, right: false }
    setStatus('ended')
    const finalProgress = completed ? 100 : latestProgressRef.current
    setProgress(finalProgress)
    setBest((current) => {
      const next = Math.max(current, finalProgress)
      localStorage.setItem(BEST_KEY, String(next))
      return next
    })
    tone(completed ? 520 : 170, completed ? 980 : 90, completed ? .32 : .2)
    endTimerRef.current = window.setTimeout(() => onGameEnd({ game: 'runner', score: collectedRef.current.size, metricLabel: 'Checkpoints', completed }), 850)
  }, [onGameEnd, tone])

  const jump = useCallback(() => {
    if (statusRef.current === 'ready' || statusRef.current === 'ended') startGame()
    if (statusRef.current === 'paused') return
    const player = playerRef.current
    if (player.onGround) {
      player.vy = -590
      player.onGround = false
      tone(220, 360, .09)
      wake()
    }
  }, [startGame, tone, wake])

  const setControl = useCallback((direction, active) => {
    if (active && statusRef.current === 'ready') startGame()
    controlsRef.current[direction] = active
    if (active) wake()
  }, [startGame, wake])

  useEffect(() => {
    const board = boardRef.current
    if (!board) return undefined
    const resize = () => setCanvasWidth(Math.max(280, Math.floor(board.clientWidth)))
    resize()
    const observer = new ResizeObserver(resize)
    observer.observe(board)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return undefined
    const canvasHeight = canvasWidth * RUN_VIEWPORT.height / RUN_VIEWPORT.width
    const ratio = Math.min(window.devicePixelRatio || 1, window.innerWidth < 700 ? 1.2 : 1.5)
    canvas.width = Math.round(canvasWidth * ratio)
    canvas.height = Math.round(canvasHeight * ratio)
    canvas.style.width = `${canvasWidth}px`
    canvas.style.height = `${canvasHeight}px`
    const context = canvas.getContext('2d')
    context.setTransform(canvas.width / RUN_VIEWPORT.width, 0, 0, canvas.height / RUN_VIEWPORT.height, 0, 0)
    let alive = true
    let lastTime = performance.now()

    const frame = (now) => {
      animationRef.current = 0
      const delta = (now - lastTime) / 1000
      lastTime = now

      if (statusRef.current === 'running') {
        const result = stepCareerRunner(playerRef.current, controlsRef.current, delta)
        playerRef.current = result.player

        if (result.collision && now > invincibleUntilRef.current) {
          invincibleUntilRef.current = now + 1100
          const nextLives = Math.max(0, livesRef.current - 1)
          livesRef.current = nextLives
          setLives(nextLives)
          tone(180, 80, .18)
          const lastCheckpoint = [...collectedRef.current].at(-1)
          playerRef.current = createCareerRunner()
          playerRef.current.x = lastCheckpoint === undefined ? 90 : RUN_CHECKPOINTS[lastCheckpoint].x + 45
          if (nextLives === 0) endGame(false)
        }

        RUN_CHECKPOINTS.forEach((checkpoint, index) => {
          if (playerRef.current.x >= checkpoint.x && !collectedRef.current.has(index)) {
            collectedRef.current.add(index)
            const unlock = onUnlock()
            setLatestStory(unlock.fact?.title || checkpoint.label)
            tone(unlock.isNew ? 520 : 420, unlock.isNew ? 920 : 680, unlock.isNew ? .22 : .12)
          }
        })

        const nextProgress = Math.min(100, Math.floor(playerRef.current.x / RUN_FINISH_X * 100))
        if (nextProgress >= latestProgressRef.current + 2) {
          latestProgressRef.current = nextProgress
          setProgress(nextProgress)
        }
        if (playerRef.current.x >= RUN_FINISH_X) endGame(true)

        const targetCamera = Math.max(0, Math.min(RUN_WORLD_WIDTH - RUN_VIEWPORT.width, playerRef.current.x - 210))
        cameraRef.current += (targetCamera - cameraRef.current) * Math.min(1, delta * 8)
      }

      drawWorld(context, playerRef.current, cameraRef.current, collectedRef.current, now, now < invincibleUntilRef.current)
      if (alive && statusRef.current === 'running') animationRef.current = requestAnimationFrame(frame)
    }

    frameRef.current = frame
    animationRef.current = requestAnimationFrame(frame)
    return () => {
      alive = false
      frameRef.current = null
      cancelAnimationFrame(animationRef.current)
      animationRef.current = 0
    }
  }, [canvasWidth, endGame, onUnlock, tone])

  useEffect(() => {
    const keyMap = { ArrowLeft: 'left', a: 'left', A: 'left', ArrowRight: 'right', d: 'right', D: 'right' }
    const keyDown = (event) => {
      if (keyMap[event.key]) { event.preventDefault(); setControl(keyMap[event.key], true) }
      else if (event.code === 'Space' || event.key === 'ArrowUp' || event.key === 'w' || event.key === 'W') { event.preventDefault(); jump() }
      else if (event.key.toLowerCase() === 'p' && statusRef.current === 'running') { statusRef.current = 'paused'; setStatus('paused') }
      else if (event.key.toLowerCase() === 'p' && statusRef.current === 'paused') { statusRef.current = 'running'; setStatus('running'); wake() }
    }
    const keyUp = (event) => { if (keyMap[event.key]) setControl(keyMap[event.key], false) }
    const release = () => { controlsRef.current = { left: false, right: false } }
    window.addEventListener('keydown', keyDown)
    window.addEventListener('keyup', keyUp)
    window.addEventListener('blur', release)
    return () => {
      window.removeEventListener('keydown', keyDown)
      window.removeEventListener('keyup', keyUp)
      window.removeEventListener('blur', release)
    }
  }, [jump, setControl, wake])

  useEffect(() => () => {
    window.clearTimeout(endTimerRef.current)
    audioRef.current?.close()
  }, [])

  const togglePause = () => {
    if (statusRef.current === 'ready' || statusRef.current === 'ended') startGame()
    else if (statusRef.current === 'paused') { statusRef.current = 'running'; setStatus('running'); wake() }
    else { statusRef.current = 'paused'; controlsRef.current = { left: false, right: false }; setStatus('paused') }
  }

  return (
    <section className="career-run">
      <header className="career-run-status">
        <div><span>Distance</span><strong>{progress}%</strong></div>
        <div className="career-run-lives" aria-label={`${lives} lives`}>{[0, 1, 2].map((index) => <i key={index} className={index < lives ? 'active' : ''} />)}</div>
        <div><span>Best</span><strong>{best}%</strong></div>
        <button type="button" onClick={togglePause}>{status === 'running' ? 'Pause' : status === 'paused' ? 'Resume' : 'New run'}</button>
      </header>

      <div className="career-run-stage">
        {latestStory && status === 'running' ? <div className="career-run-story" key={latestStory}><span>Checkpoint saved</span><strong>{latestStory}</strong></div> : null}
        <div className="career-run-board" ref={boardRef}>
          <canvas ref={canvasRef} aria-label={`Career Run. ${progress}% complete with ${lives} lives.`} />
          {status !== 'running' ? (
            <div className="career-run-overlay">
              <span>Original portfolio game</span>
              <strong>{status === 'paused' ? 'Paused' : status === 'ended' ? 'Run complete' : 'Career Run'}</strong>
              <p>{status === 'ended' ? 'Preparing your story cards...' : 'Move, jump, avoid obstacles, and reach real career checkpoints.'}</p>
              {status !== 'ended' ? <button type="button" onClick={status === 'paused' ? togglePause : startGame}>{status === 'paused' ? 'Continue' : 'Start run'}</button> : null}
            </div>
          ) : null}
        </div>

        <div className="career-run-controls" aria-label="Career Run controls">
          <button type="button" onPointerDown={() => setControl('left', true)} onPointerUp={() => setControl('left', false)} onPointerCancel={() => setControl('left', false)} aria-label="Move left">←</button>
          <button type="button" className="jump" onClick={jump}>Jump</button>
          <button type="button" onPointerDown={() => setControl('right', true)} onPointerUp={() => setControl('right', false)} onPointerCancel={() => setControl('right', false)} aria-label="Move right">→</button>
        </div>
      </div>
    </section>
  )
}
