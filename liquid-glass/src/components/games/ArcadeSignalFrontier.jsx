import { useCallback, useEffect, useRef, useState } from 'react'
import {
  advanceNodeCapture,
  chooseEnemyType,
  circlesOverlap,
  clampToFrontierWorld,
  createFrontierNodes,
  createFrontierPlayer,
  FRONTIER_ENEMY_STATS,
  FRONTIER_NEXUS,
  FRONTIER_VIEWPORT,
  FRONTIER_WORLD,
  getFrontierUpgrades,
  normalizeVector,
  squaredDistance
} from '../../lib/signalFrontierGame'
import './ArcadeSignalFrontier.css'

const MAX_ENEMIES = 26
const MAP_MARKERS = Array.from({ length: 100 }, (_, index) => ({
  x: 55 + ((index * 307) % (FRONTIER_WORLD.width - 110)),
  y: 55 + ((index * 173) % (FRONTIER_WORLD.height - 110)),
  size: 1 + (index % 3),
  alpha: .08 + (index % 5) * .018
}))
const TERRAIN_ZONES = [
  { x: 240, y: 150, rx: 500, ry: 330, color: 'rgba(28,112,111,.11)' },
  { x: 1640, y: 100, rx: 610, ry: 390, color: 'rgba(33,92,151,.11)' },
  { x: 1560, y: 960, rx: 680, ry: 460, color: 'rgba(179,113,42,.09)' },
  { x: 80, y: 930, rx: 650, ry: 430, color: 'rgba(154,55,92,.09)' }
]
const LANDMARKS = Array.from({ length: 28 }, (_, index) => ({
  x: 110 + ((index * 491) % (FRONTIER_WORLD.width - 220)),
  y: 100 + ((index * 277) % (FRONTIER_WORLD.height - 200)),
  rotation: (index % 8) * Math.PI / 4,
  scale: .7 + (index % 4) * .15
}))

function roundRect(context, x, y, width, height, radius, color) {
  context.fillStyle = color
  context.beginPath()
  context.roundRect(x, y, width, height, radius)
  context.fill()
}

function worldToScreen(point, camera) {
  return { x: point.x - camera.x, y: point.y - camera.y }
}

function spawnParticles(target, x, y, color, count, speed = 120) {
  for (let index = 0; index < count; index += 1) {
    const angle = Math.random() * Math.PI * 2
    const velocity = speed * (.35 + Math.random() * .8)
    target.push({
      x,
      y,
      vx: Math.cos(angle) * velocity,
      vy: Math.sin(angle) * velocity,
      life: .35 + Math.random() * .55,
      maxLife: .9,
      size: 1.5 + Math.random() * 3.5,
      color
    })
  }
}

function drawStrategicMap(context, camera, nodes, time, compactMode) {
  const background = context.createLinearGradient(0, 0, 0, FRONTIER_VIEWPORT.height)
  background.addColorStop(0, '#07131d')
  background.addColorStop(1, '#0b1b22')
  context.fillStyle = background
  context.fillRect(0, 0, FRONTIER_VIEWPORT.width, FRONTIER_VIEWPORT.height)

  TERRAIN_ZONES.forEach((zone) => {
    const point = worldToScreen(zone, camera)
    context.fillStyle = zone.color
    context.beginPath()
    context.ellipse(point.x, point.y, zone.rx, zone.ry, -.2, 0, Math.PI * 2)
    context.fill()
  })

  context.strokeStyle = 'rgba(126,192,199,.07)'
  context.lineWidth = 1
  const grid = 80
  for (let x = -(camera.x % grid); x <= FRONTIER_VIEWPORT.width; x += grid) {
    context.beginPath(); context.moveTo(x, 0); context.lineTo(x, FRONTIER_VIEWPORT.height); context.stroke()
  }
  for (let y = -(camera.y % grid); y <= FRONTIER_VIEWPORT.height; y += grid) {
    context.beginPath(); context.moveTo(0, y); context.lineTo(FRONTIER_VIEWPORT.width, y); context.stroke()
  }

  MAP_MARKERS.forEach((marker, index) => {
    if (compactMode && index % 2) return
    const point = worldToScreen(marker, camera)
    if (point.x < -5 || point.x > FRONTIER_VIEWPORT.width + 5 || point.y < -5 || point.y > FRONTIER_VIEWPORT.height + 5) return
    context.fillStyle = `rgba(183,232,224,${marker.alpha})`
    context.fillRect(point.x, point.y, marker.size, marker.size)
  })

  LANDMARKS.forEach((landmark, index) => {
    if (compactMode && index % 2) return
    const point = worldToScreen(landmark, camera)
    if (point.x < -40 || point.x > FRONTIER_VIEWPORT.width + 40 || point.y < -40 || point.y > FRONTIER_VIEWPORT.height + 40) return
    context.save()
    context.translate(point.x, point.y)
    context.rotate(landmark.rotation)
    context.scale(landmark.scale, landmark.scale)
    context.strokeStyle = index % 3 === 0 ? 'rgba(109,184,184,.15)' : 'rgba(109,184,184,.09)'
    context.lineWidth = 1
    context.strokeRect(-7, -7, 14, 14)
    context.beginPath(); context.moveTo(-13, 0); context.lineTo(13, 0); context.moveTo(0, -13); context.lineTo(0, 13); context.stroke()
    context.restore()
  })

  const nexus = worldToScreen(FRONTIER_NEXUS, camera)
  nodes.forEach((node) => {
    const point = worldToScreen(node, camera)
    context.save()
    context.translate(point.x, point.y)
    context.fillStyle = node.captured ? `${node.color}0f` : 'rgba(91,132,139,.018)'
    context.strokeStyle = node.captured ? `${node.color}3d` : 'rgba(125,164,170,.075)'
    context.lineWidth = node.captured ? 2 : 1
    context.beginPath()
    for (let index = 0; index < 6; index += 1) {
      const angle = -Math.PI / 2 + index * Math.PI / 3
      const radius = 245
      const x = Math.cos(angle) * radius
      const y = Math.sin(angle) * radius
      if (index === 0) context.moveTo(x, y)
      else context.lineTo(x, y)
    }
    context.closePath(); context.fill(); context.stroke()
    context.restore()

    context.strokeStyle = node.captured ? `${node.color}9a` : 'rgba(133,164,173,.12)'
    context.lineWidth = node.captured ? 2.5 : 1
    context.setLineDash(node.captured ? [] : [7, 8])
    context.beginPath()
    context.moveTo(nexus.x, nexus.y)
    context.lineTo(point.x, point.y)
    context.stroke()
    context.setLineDash([])

    if (node.captured) {
      const glow = context.createRadialGradient(point.x, point.y, 12, point.x, point.y, 180)
      glow.addColorStop(0, `${node.color}35`)
      glow.addColorStop(1, `${node.color}00`)
      context.fillStyle = glow
      context.beginPath(); context.arc(point.x, point.y, 180, 0, Math.PI * 2); context.fill()
    }
  })

  context.strokeStyle = 'rgba(86,214,199,.2)'
  context.lineWidth = 2
  context.beginPath()
  context.moveTo(-camera.x, 620 - camera.y)
  context.bezierCurveTo(600 - camera.x, 500 - camera.y, 1460 - camera.x, 960 - camera.y, FRONTIER_WORLD.width - camera.x, 790 - camera.y)
  context.stroke()

  const pulse = 1 + Math.sin(time / 380) * .08
  context.save()
  context.translate(nexus.x, nexus.y)
  context.strokeStyle = nodes.every(({ captured }) => captured) ? '#f5d56a' : 'rgba(104,191,188,.6)'
  context.lineWidth = 3
  context.beginPath(); context.arc(0, 0, FRONTIER_NEXUS.radius * pulse, 0, Math.PI * 2); context.stroke()
  context.rotate(time / 2400)
  context.strokeStyle = 'rgba(151,222,217,.28)'
  context.setLineDash([12, 10])
  context.beginPath(); context.arc(0, 0, 96, 0, Math.PI * 2); context.stroke()
  context.setLineDash([])
  context.fillStyle = '#102c34'
  context.beginPath(); context.moveTo(0, -29); context.lineTo(25, 16); context.lineTo(-25, 16); context.closePath(); context.fill()
  context.restore()
}

function drawNode(context, node, camera, time, contested) {
  const point = worldToScreen(node, camera)
  if (point.x < -130 || point.x > FRONTIER_VIEWPORT.width + 130 || point.y < -130 || point.y > FRONTIER_VIEWPORT.height + 130) return
  const radius = 44

  context.save()
  context.translate(point.x, point.y)
  context.shadowColor = node.color
  context.shadowBlur = node.captured ? 24 : 10
  context.fillStyle = node.captured ? `${node.color}33` : 'rgba(10,27,36,.9)'
  context.beginPath(); context.arc(0, 0, radius, 0, Math.PI * 2); context.fill()
  context.shadowBlur = 0

  context.strokeStyle = node.captured ? node.color : 'rgba(152,188,195,.42)'
  context.lineWidth = 3
  context.beginPath(); context.arc(0, 0, radius, 0, Math.PI * 2); context.stroke()

  if (!node.captured && node.progress > 0) {
    context.strokeStyle = contested ? '#ff627d' : node.color
    context.lineWidth = 6
    context.beginPath(); context.arc(0, 0, radius + 8, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * node.progress); context.stroke()
  }

  context.rotate(-time / 1600)
  context.strokeStyle = `${node.color}77`
  context.setLineDash([5, 7])
  context.beginPath(); context.arc(0, 0, radius + 16, 0, Math.PI * 2); context.stroke()
  context.setLineDash([])
  context.rotate(time / 1600)
  context.fillStyle = node.captured ? '#ecfffb' : '#9eb4b8'
  context.font = '800 12px Avenir Next, sans-serif'
  context.textAlign = 'center'
  context.fillText(node.label.toUpperCase(), 0, 3)
  if (node.captured) {
    context.fillStyle = node.color
    context.beginPath(); context.arc(0, 17, 3, 0, Math.PI * 2); context.fill()
  }
  context.restore()
}

function drawPlayer(context, player, camera, time) {
  const point = worldToScreen(player, camera)
  if (time < player.invincibleUntil && Math.floor(time / 75) % 2) return
  context.save()
  context.translate(point.x, point.y)
  context.rotate(player.angle)
  context.shadowColor = '#6ddcf3'
  context.shadowBlur = 18
  context.fillStyle = '#5bc7ec'
  context.beginPath(); context.moveTo(25, 0); context.lineTo(-14, -14); context.lineTo(-8, 0); context.lineTo(-14, 14); context.closePath(); context.fill()
  context.shadowBlur = 0
  context.fillStyle = '#e6f7ff'
  context.beginPath(); context.arc(2, 0, 8, 0, Math.PI * 2); context.fill()
  context.fillStyle = '#173c55'
  context.fillRect(9, -3, 22, 6)
  context.restore()

  context.strokeStyle = 'rgba(95,210,232,.32)'
  context.lineWidth = 2
  context.beginPath(); context.arc(point.x, point.y, player.radius + 8 + Math.sin(time / 170) * 2, 0, Math.PI * 2); context.stroke()
}

function drawPlayerProtocol(context, player, camera, upgrades, time) {
  if (!upgrades.aegis) return
  const point = worldToScreen(player, camera)
  context.save()
  context.translate(point.x, point.y)
  context.rotate(time / 850)
  context.strokeStyle = 'rgba(94,234,212,.55)'
  context.lineWidth = 2
  context.setLineDash([18, 14])
  context.beginPath(); context.arc(0, 0, 31, 0, Math.PI * 2); context.stroke()
  context.setLineDash([])
  context.restore()
}

function drawEnemy(context, enemy, camera, time) {
  const point = worldToScreen(enemy, camera)
  const stats = FRONTIER_ENEMY_STATS[enemy.type]
  context.save()
  context.translate(point.x, point.y)
  context.rotate(enemy.angle + Math.PI / 2)
  context.shadowColor = stats.color
  context.shadowBlur = 13
  context.fillStyle = stats.color
  if (enemy.type === 'brute') {
    context.beginPath()
    for (let index = 0; index < 6; index += 1) {
      const angle = index / 6 * Math.PI * 2
      const radius = index % 2 ? stats.radius * .78 : stats.radius
      const x = Math.cos(angle) * radius
      const y = Math.sin(angle) * radius
      if (index === 0) context.moveTo(x, y)
      else context.lineTo(x, y)
    }
    context.closePath(); context.fill()
  } else if (enemy.type === 'sentinel') {
    roundRect(context, -stats.radius, -stats.radius, stats.radius * 2, stats.radius * 2, 5, stats.color)
    context.fillStyle = '#35231e'; context.fillRect(-3, -stats.radius - 8, 6, 17)
  } else {
    context.beginPath(); context.moveTo(0, -stats.radius); context.lineTo(stats.radius, stats.radius); context.lineTo(0, stats.radius * .45); context.lineTo(-stats.radius, stats.radius); context.closePath(); context.fill()
  }
  context.shadowBlur = 0
  context.fillStyle = '#291826'
  context.beginPath(); context.arc(0, 0, Math.max(4, stats.radius * .34), 0, Math.PI * 2); context.fill()
  context.restore()

  if (enemy.health < stats.health) {
    context.fillStyle = 'rgba(0,0,0,.45)'; context.fillRect(point.x - stats.radius, point.y - stats.radius - 10, stats.radius * 2, 3)
    context.fillStyle = stats.color; context.fillRect(point.x - stats.radius, point.y - stats.radius - 10, stats.radius * 2 * enemy.health / stats.health, 3)
  }
  if (enemy.type === 'sentinel') {
    context.strokeStyle = `rgba(255,180,94,${.18 + Math.sin(time / 190) * .06})`
    context.beginPath(); context.arc(point.x, point.y, 27, 0, Math.PI * 2); context.stroke()
  }
}

function drawProjectile(context, projectile, camera, hostile = false) {
  const point = worldToScreen(projectile, camera)
  const color = hostile ? '#ff8d72' : '#8ff6ff'
  context.shadowColor = color
  context.shadowBlur = 12
  context.strokeStyle = color
  context.lineWidth = hostile ? 2.4 : 2
  context.beginPath()
  context.moveTo(point.x, point.y)
  context.lineTo(point.x - projectile.vx * .025, point.y - projectile.vy * .025)
  context.stroke()
  context.fillStyle = color
  context.beginPath(); context.arc(point.x, point.y, hostile ? 4 : 3.2, 0, Math.PI * 2); context.fill()
  context.shadowBlur = 0
}

function drawParticles(context, particles, camera) {
  particles.forEach((particle) => {
    const point = worldToScreen(particle, camera)
    context.globalAlpha = Math.max(0, particle.life / particle.maxLife)
    context.fillStyle = particle.color
    context.fillRect(point.x - particle.size / 2, point.y - particle.size / 2, particle.size, particle.size)
  })
  context.globalAlpha = 1
}

function drawMinimap(context, player, enemies, nodes) {
  const x = FRONTIER_VIEWPORT.width - 162
  const y = 18
  const width = 144
  const height = 96
  roundRect(context, x, y, width, height, 9, 'rgba(3,12,18,.78)')
  context.strokeStyle = 'rgba(153,217,215,.25)'; context.strokeRect(x + .5, y + .5, width - 1, height - 1)
  nodes.forEach((node) => {
    context.fillStyle = node.captured ? node.color : '#53666c'
    context.beginPath(); context.arc(x + node.x / FRONTIER_WORLD.width * width, y + node.y / FRONTIER_WORLD.height * height, 3.5, 0, Math.PI * 2); context.fill()
  })
  context.fillStyle = '#ff6a7f'
  enemies.slice(0, 18).forEach((enemy) => context.fillRect(x + enemy.x / FRONTIER_WORLD.width * width - 1, y + enemy.y / FRONTIER_WORLD.height * height - 1, 2, 2))
  context.fillStyle = '#8ff6ff'
  context.beginPath(); context.arc(x + player.x / FRONTIER_WORLD.width * width, y + player.y / FRONTIER_WORLD.height * height, 3, 0, Math.PI * 2); context.fill()
}

function drawWaypoint(context, player, nodes, camera) {
  const remaining = nodes.filter(({ captured }) => !captured)
  const target = remaining.reduce((nearest, node) => !nearest || squaredDistance(player, node) < squaredDistance(player, nearest) ? node : nearest, null) || FRONTIER_NEXUS
  const point = worldToScreen(target, camera)
  const margin = 64
  const visible = point.x > margin && point.x < FRONTIER_VIEWPORT.width - margin && point.y > margin && point.y < FRONTIER_VIEWPORT.height - margin
  if (visible) return

  const center = { x: FRONTIER_VIEWPORT.width / 2, y: FRONTIER_VIEWPORT.height / 2 }
  const direction = normalizeVector(point.x - center.x, point.y - center.y)
  const radiusX = FRONTIER_VIEWPORT.width / 2 - margin
  const radiusY = FRONTIER_VIEWPORT.height / 2 - margin
  const scale = Math.min(Math.abs(radiusX / (direction.x || .001)), Math.abs(radiusY / (direction.y || .001)))
  const x = center.x + direction.x * scale
  const y = center.y + direction.y * scale
  context.save()
  context.translate(x, y)
  context.rotate(Math.atan2(direction.y, direction.x))
  context.fillStyle = target.color || '#f5d56a'
  context.shadowColor = target.color || '#f5d56a'
  context.shadowBlur = 12
  context.beginPath(); context.moveTo(14, 0); context.lineTo(-8, -8); context.lineTo(-3, 0); context.lineTo(-8, 8); context.closePath(); context.fill()
  context.restore()
  context.shadowBlur = 0
}

function drawCaptureCinematic(context, cinematic, camera, now) {
  if (!cinematic?.node || now >= cinematic.until) return
  const duration = cinematic.until - cinematic.startedAt
  const progress = Math.max(0, Math.min(1, (now - cinematic.startedAt) / duration))
  const fade = Math.min(1, progress * 7, (1 - progress) * 5)
  const point = worldToScreen(cinematic.node, camera)
  const radius = 55 + progress * 280

  context.save()
  context.globalAlpha = fade
  context.strokeStyle = cinematic.node.color
  context.lineWidth = Math.max(1, 6 * (1 - progress))
  context.beginPath(); context.arc(point.x, point.y, radius, 0, Math.PI * 2); context.stroke()
  context.fillStyle = `${cinematic.node.color}0b`
  context.fillRect(0, 0, FRONTIER_VIEWPORT.width, FRONTIER_VIEWPORT.height)
  context.textAlign = 'center'
  context.fillStyle = '#effffc'
  context.font = '900 34px Avenir Next, sans-serif'
  context.fillText(`${cinematic.node.label.toUpperCase()} SECURED`, FRONTIER_VIEWPORT.width / 2, FRONTIER_VIEWPORT.height - 72)
  context.restore()
}

function drawScreenTreatment(context, time, compactMode) {
  const vignette = context.createRadialGradient(480, 270, 120, 480, 270, 610)
  vignette.addColorStop(.55, 'rgba(0,0,0,0)')
  vignette.addColorStop(1, 'rgba(0,5,9,.52)')
  context.fillStyle = vignette
  context.fillRect(0, 0, FRONTIER_VIEWPORT.width, FRONTIER_VIEWPORT.height)
  if (compactMode) return
  const sweepY = (time / 18) % (FRONTIER_VIEWPORT.height + 120) - 60
  const sweep = context.createLinearGradient(0, sweepY - 30, 0, sweepY + 30)
  sweep.addColorStop(0, 'rgba(116,231,220,0)')
  sweep.addColorStop(.5, 'rgba(116,231,220,.035)')
  sweep.addColorStop(1, 'rgba(116,231,220,0)')
  context.fillStyle = sweep
  context.fillRect(0, sweepY - 30, FRONTIER_VIEWPORT.width, 60)
}

function createEnemy(player, capturedCount, id) {
  const type = chooseEnemyType(capturedCount)
  const stats = FRONTIER_ENEMY_STATS[type]
  const angle = Math.random() * Math.PI * 2
  const distance = 470 + Math.random() * 230
  const position = clampToFrontierWorld({ x: player.x + Math.cos(angle) * distance, y: player.y + Math.sin(angle) * distance }, 45)
  return { id, type, ...position, radius: stats.radius, health: stats.health, angle: 0, nextShotAt: 0 }
}

function createDefender(node, capturedCount, id, slot) {
  const type = slot === 0 && capturedCount > 0 ? 'sentinel' : chooseEnemyType(capturedCount)
  const stats = FRONTIER_ENEMY_STATS[type]
  const angle = slot / 4 * Math.PI * 2 + .45
  return {
    id,
    type,
    x: node.x + Math.cos(angle) * (128 + slot * 15),
    y: node.y + Math.sin(angle) * (128 + slot * 15),
    radius: stats.radius,
    health: stats.health,
    angle: 0,
    nextShotAt: 0
  }
}

export default function ArcadeSignalFrontier({ onUnlock, onSessionStart, onGameEnd }) {
  const [status, setStatus] = useState('ready')
  const [health, setHealth] = useState(100)
  const [capturedCount, setCapturedCount] = useState(0)
  const [dashReady, setDashReady] = useState(true)
  const [canvasWidth, setCanvasWidth] = useState(840)
  const canvasRef = useRef(null)
  const boardRef = useRef(null)
  const playerRef = useRef(createFrontierPlayer())
  const nodesRef = useRef(createFrontierNodes())
  const enemiesRef = useRef([])
  const bulletsRef = useRef([])
  const hostileBulletsRef = useRef([])
  const particlesRef = useRef([])
  const inputRef = useRef({ up: false, down: false, left: false, right: false, fire: false, autoAim: true, dash: false })
  const pointerRef = useRef({ x: FRONTIER_VIEWPORT.width / 2, y: FRONTIER_VIEWPORT.height / 2, inside: false })
  const cameraRef = useRef({ x: FRONTIER_NEXUS.x - FRONTIER_VIEWPORT.width / 2, y: FRONTIER_NEXUS.y - FRONTIER_VIEWPORT.height / 2 })
  const healthRef = useRef(100)
  const scoreRef = useRef(0)
  const statusRef = useRef('ready')
  const capturedRef = useRef(0)
  const enemyIdRef = useRef(1)
  const lastSpawnAtRef = useRef(0)
  const lastShotAtRef = useRef(0)
  const dashReadyAtRef = useRef(0)
  const dashReadyRef = useRef(true)
  const upgradesRef = useRef(getFrontierUpgrades([]))
  const contestedNodeRef = useRef('')
  const cinematicRef = useRef(null)
  const shakeRef = useRef({ until: 0, power: 0 })
  const lastTrailAtRef = useRef(0)
  const lastRepairAtRef = useRef(0)
  const animationRef = useRef(0)
  const frameRef = useRef(null)
  const audioRef = useRef(null)
  const endTimerRef = useRef(0)

  const ensureAudio = useCallback(() => {
    if (!audioRef.current) {
      const AudioContext = window.AudioContext || window.webkitAudioContext
      if (AudioContext) audioRef.current = new AudioContext()
    }
    if (audioRef.current?.state === 'suspended') audioRef.current.resume()
    return audioRef.current
  }, [])

  const tone = useCallback((frequency, endFrequency, duration = .08, volume = .018, type = 'sine') => {
    const audio = ensureAudio()
    if (!audio) return
    const oscillator = audio.createOscillator()
    const gain = audio.createGain()
    oscillator.type = type
    oscillator.frequency.setValueAtTime(frequency, audio.currentTime)
    oscillator.frequency.exponentialRampToValueAtTime(endFrequency, audio.currentTime + duration)
    gain.gain.setValueAtTime(volume, audio.currentTime)
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
    playerRef.current = createFrontierPlayer()
    nodesRef.current = createFrontierNodes()
    enemiesRef.current = []
    bulletsRef.current = []
    hostileBulletsRef.current = []
    particlesRef.current = []
    inputRef.current = { up: false, down: false, left: false, right: false, fire: false, autoAim: true, dash: false }
    cameraRef.current = { x: FRONTIER_NEXUS.x - FRONTIER_VIEWPORT.width / 2, y: FRONTIER_NEXUS.y - FRONTIER_VIEWPORT.height / 2 }
    healthRef.current = 100
    scoreRef.current = 0
    capturedRef.current = 0
    enemyIdRef.current = 1
    lastSpawnAtRef.current = 0
    lastShotAtRef.current = 0
    dashReadyAtRef.current = 0
    dashReadyRef.current = true
    upgradesRef.current = getFrontierUpgrades(nodesRef.current)
    contestedNodeRef.current = ''
    cinematicRef.current = null
    lastTrailAtRef.current = 0
    lastRepairAtRef.current = 0
    statusRef.current = 'running'
    setStatus('running')
    setHealth(100)
    setCapturedCount(0)
    setDashReady(true)
    wake()
  }, [ensureAudio, onSessionStart, wake])

  const endGame = useCallback((completed) => {
    if (statusRef.current === 'ended') return
    statusRef.current = 'ended'
    inputRef.current = { up: false, down: false, left: false, right: false, fire: false, autoAim: true, dash: false }
    setStatus('ended')
    tone(completed ? 440 : 180, completed ? 1040 : 70, completed ? .45 : .24, .045, completed ? 'triangle' : 'sawtooth')
    endTimerRef.current = window.setTimeout(() => onGameEnd({ game: 'runner', score: scoreRef.current, metricLabel: 'Network score', completed }), 1100)
  }, [onGameEnd, tone])

  const setControl = useCallback((control, active, autoAim = true) => {
    if (active && statusRef.current === 'ready') startGame()
    inputRef.current[control] = active
    if (control === 'fire') inputRef.current.autoAim = autoAim
    if (active) wake()
  }, [startGame, wake])

  const queueDash = useCallback(() => {
    if (statusRef.current === 'ready') startGame()
    inputRef.current.dash = true
    wake()
  }, [startGame, wake])

  useEffect(() => {
    const board = boardRef.current
    if (!board) return undefined
    const resize = () => setCanvasWidth(Math.max(300, Math.floor(board.clientWidth)))
    resize()
    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', resize)
      return () => window.removeEventListener('resize', resize)
    }
    const observer = new ResizeObserver(resize)
    observer.observe(board)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return undefined
    const canvasHeight = canvasWidth * FRONTIER_VIEWPORT.height / FRONTIER_VIEWPORT.width
    const compactMode = canvasWidth < 700 || window.innerWidth < 700
    const ratio = Math.min(window.devicePixelRatio || 1, compactMode ? 1.05 : 1.35)
    canvas.width = Math.round(canvasWidth * ratio)
    canvas.height = Math.round(canvasHeight * ratio)
    canvas.style.width = `${canvasWidth}px`
    canvas.style.height = `${canvasHeight}px`
    const context = canvas.getContext('2d')
    if (!context) return undefined
    context.setTransform(canvas.width / FRONTIER_VIEWPORT.width, 0, 0, canvas.height / FRONTIER_VIEWPORT.height, 0, 0)
    let alive = true
    let lastTime = performance.now()

    const frame = (now) => {
      animationRef.current = 0
      const delta = Math.min(.034, Math.max(0, (now - lastTime) / 1000))
      lastTime = now

      if (statusRef.current === 'running') {
        const player = playerRef.current
        const input = inputRef.current
        const movement = normalizeVector(Number(input.right) - Number(input.left), Number(input.down) - Number(input.up))
        const movementSpeed = 220 + capturedRef.current * 9
        player.x += movement.x * movementSpeed * delta
        player.y += movement.y * movementSpeed * delta
        const clampedPlayer = clampToFrontierWorld(player)
        player.x = clampedPlayer.x
        player.y = clampedPlayer.y

        if (movement.length && now - lastTrailAtRef.current > 44) {
          lastTrailAtRef.current = now
          particlesRef.current.push({
            x: player.x - Math.cos(player.angle) * 19,
            y: player.y - Math.sin(player.angle) * 19,
            vx: -Math.cos(player.angle) * 34 + (Math.random() - .5) * 18,
            vy: -Math.sin(player.angle) * 34 + (Math.random() - .5) * 18,
            life: .28,
            maxLife: .28,
            size: 2.2,
            color: '#66ddeb'
          })
        }

        if (input.dash) {
          input.dash = false
          if (now >= dashReadyAtRef.current) {
            const direction = movement.length ? movement : { x: Math.cos(player.angle), y: Math.sin(player.angle) }
            player.x += direction.x * 175
            player.y += direction.y * 175
            const dashPosition = clampToFrontierWorld(player)
            player.x = dashPosition.x
            player.y = dashPosition.y
            player.invincibleUntil = now + 330
            dashReadyAtRef.current = now + (upgradesRef.current.flux ? 1250 : 2200)
            dashReadyRef.current = false
            setDashReady(false)
            spawnParticles(particlesRef.current, player.x, player.y, '#74e6ff', 18, 210)
            tone(210, 620, .11, .025, 'sawtooth')
          }
        }
        if (!dashReadyRef.current && now >= dashReadyAtRef.current) {
          dashReadyRef.current = true
          setDashReady(true)
        }

        const fireInterval = upgradesRef.current.overclock ? 88 : Math.max(112, 175 - capturedRef.current * 12)
        if (input.fire && now - lastShotAtRef.current >= fireInterval) {
          let target = null
          if (!input.autoAim && pointerRef.current.inside) {
            target = { x: cameraRef.current.x + pointerRef.current.x, y: cameraRef.current.y + pointerRef.current.y }
          } else {
            target = enemiesRef.current.reduce((nearest, enemy) => !nearest || squaredDistance(enemy, player) < squaredDistance(nearest, player) ? enemy : nearest, null)
          }
          if (target) {
            const direction = normalizeVector(target.x - player.x, target.y - player.y)
            player.angle = Math.atan2(direction.y, direction.x)
            const shotAngles = upgradesRef.current.twin ? [-.055, .055] : [0]
            shotAngles.forEach((offset) => {
              const angle = player.angle + offset
              const shotDirection = { x: Math.cos(angle), y: Math.sin(angle) }
              bulletsRef.current.push({ x: player.x + shotDirection.x * 24, y: player.y + shotDirection.y * 24, vx: shotDirection.x * 680, vy: shotDirection.y * 680, radius: 4, life: 1.25 })
            })
            lastShotAtRef.current = now
            tone(260, 170, .045, .009, 'square')
          }
        } else if (!input.fire && pointerRef.current.inside) {
          const target = { x: cameraRef.current.x + pointerRef.current.x, y: cameraRef.current.y + pointerRef.current.y }
          player.angle = Math.atan2(target.y - player.y, target.x - player.x)
        } else if (movement.length) player.angle = Math.atan2(movement.y, movement.x)

        const spawnInterval = Math.max(620, 1550 - capturedRef.current * 175)
        const enemyLimit = compactMode ? 18 : MAX_ENEMIES
        if (now - lastSpawnAtRef.current >= spawnInterval && enemiesRef.current.length < enemyLimit) {
          const spawnCount = capturedRef.current >= 3 && Math.random() > .55 ? 2 : 1
          for (let index = 0; index < spawnCount; index += 1) enemiesRef.current.push(createEnemy(player, capturedRef.current, enemyIdRef.current++))
          lastSpawnAtRef.current = now
        }

        enemiesRef.current.forEach((enemy) => {
          const stats = FRONTIER_ENEMY_STATS[enemy.type]
          const direction = normalizeVector(player.x - enemy.x, player.y - enemy.y)
          enemy.angle = Math.atan2(direction.y, direction.x)
          let velocity = 1
          if (enemy.type === 'sentinel') {
            velocity = direction.length > 300 ? 1 : direction.length < 210 ? -.75 : 0
            if (direction.length < 470 && now >= enemy.nextShotAt) {
              hostileBulletsRef.current.push({ x: enemy.x, y: enemy.y, vx: direction.x * 245, vy: direction.y * 245, radius: 5, life: 4 })
              enemy.nextShotAt = now + 1350 + Math.random() * 450
            }
          }
          enemy.x += direction.x * stats.speed * velocity * delta
          enemy.y += direction.y * stats.speed * velocity * delta
        })

        if (upgradesRef.current.aegis && healthRef.current < 100 && now - lastRepairAtRef.current >= 720) {
          lastRepairAtRef.current = now
          healthRef.current += 1
          setHealth(healthRef.current)
        }

        bulletsRef.current.forEach((bullet) => { bullet.x += bullet.vx * delta; bullet.y += bullet.vy * delta; bullet.life -= delta })
        hostileBulletsRef.current.forEach((bullet) => { bullet.x += bullet.vx * delta; bullet.y += bullet.vy * delta; bullet.life -= delta })
        bulletsRef.current = bulletsRef.current.filter(({ life }) => life > 0)
        hostileBulletsRef.current = hostileBulletsRef.current.filter(({ life }) => life > 0)

        for (let bulletIndex = bulletsRef.current.length - 1; bulletIndex >= 0; bulletIndex -= 1) {
          const bullet = bulletsRef.current[bulletIndex]
          const enemyIndex = enemiesRef.current.findIndex((enemy) => circlesOverlap(bullet, enemy))
          if (enemyIndex < 0) continue
          const enemy = enemiesRef.current[enemyIndex]
          enemy.health -= 1
          bulletsRef.current.splice(bulletIndex, 1)
          spawnParticles(particlesRef.current, bullet.x, bullet.y, FRONTIER_ENEMY_STATS[enemy.type].color, 5, 80)
          if (enemy.health <= 0) {
            const stats = FRONTIER_ENEMY_STATS[enemy.type]
            enemiesRef.current.splice(enemyIndex, 1)
            scoreRef.current += stats.score
            spawnParticles(particlesRef.current, enemy.x, enemy.y, stats.color, enemy.type === 'brute' ? 20 : 12, 165)
            tone(enemy.type === 'brute' ? 150 : 310, enemy.type === 'brute' ? 70 : 480, .08, .014, 'triangle')
          }
        }

        const takeDamage = (damage, source) => {
          if (now < player.invincibleUntil || statusRef.current !== 'running') return
          player.invincibleUntil = now + 650
          healthRef.current = Math.max(0, healthRef.current - damage)
          setHealth(healthRef.current)
          shakeRef.current = { until: now + 260, power: Math.min(10, damage * .35) }
          spawnParticles(particlesRef.current, player.x, player.y, '#ff687f', 12, 160)
          tone(190, 75, .16, .026, 'sawtooth')
          if (source) {
            const push = normalizeVector(player.x - source.x, player.y - source.y)
            player.x += push.x * 45; player.y += push.y * 45
            const pushedPosition = clampToFrontierWorld(player)
            player.x = pushedPosition.x; player.y = pushedPosition.y
          }
          if (healthRef.current <= 0) endGame(false)
        }

        for (let index = hostileBulletsRef.current.length - 1; index >= 0; index -= 1) {
          const bullet = hostileBulletsRef.current[index]
          if (circlesOverlap(player, bullet)) {
            hostileBulletsRef.current.splice(index, 1)
            takeDamage(15, bullet)
          }
        }
        enemiesRef.current.forEach((enemy) => {
          if (circlesOverlap(player, enemy)) takeDamage(FRONTIER_ENEMY_STATS[enemy.type].damage, enemy)
        })

        let activeCapture = null
        nodesRef.current = nodesRef.current.map((node) => {
          if (node.captured) return node
          const nearNode = squaredDistance(player, node) <= 165 * 165
          if (nearNode && !node.engaged) {
            const defenders = capturedRef.current > 1 ? 4 : 3
            for (let slot = 0; slot < defenders; slot += 1) enemiesRef.current.push(createDefender(node, capturedRef.current, enemyIdRef.current++, slot))
          }
          const contested = enemiesRef.current.some((enemy) => squaredDistance(enemy, node) < 140 * 140)
          const next = { ...advanceNodeCapture(node, player, contested, delta), engaged: node.engaged || nearNode }
          if (squaredDistance(player, node) <= 110 * 110) activeCapture = { node: next, contested }
          if (next.captured && !node.captured) {
            capturedRef.current += 1
            setCapturedCount(capturedRef.current)
            scoreRef.current += 650
            healthRef.current = Math.min(100, healthRef.current + 28)
            setHealth(healthRef.current)
            upgradesRef.current = { ...upgradesRef.current, [next.protocol]: true }
            onUnlock(next.sections)
            cinematicRef.current = { node: next, startedAt: now, until: now + 1800 }
            shakeRef.current = { until: now + 520, power: 4.5 }
            spawnParticles(particlesRef.current, next.x, next.y, next.color, 34, 210)
            boardRef.current?.animate?.([{ filter: 'brightness(1)' }, { filter: 'brightness(1.28)' }, { filter: 'brightness(1)' }], { duration: 460, easing: 'ease-out' })
            tone(360, 960, .34, .045, 'triangle')
          }
          return next
        })

        contestedNodeRef.current = activeCapture?.contested ? activeCapture.node.id : ''

        if (capturedRef.current === nodesRef.current.length && squaredDistance(player, FRONTIER_NEXUS) <= FRONTIER_NEXUS.radius * FRONTIER_NEXUS.radius) endGame(true)

        particlesRef.current.forEach((particle) => {
          particle.x += particle.vx * delta; particle.y += particle.vy * delta
          particle.vx *= .96; particle.vy *= .96; particle.life -= delta
        })
        const particleLimit = compactMode ? 70 : 130
        particlesRef.current = particlesRef.current.filter(({ life }) => life > 0).slice(-particleLimit)

        const targetCamera = {
          x: Math.max(0, Math.min(FRONTIER_WORLD.width - FRONTIER_VIEWPORT.width, player.x - FRONTIER_VIEWPORT.width / 2)),
          y: Math.max(0, Math.min(FRONTIER_WORLD.height - FRONTIER_VIEWPORT.height, player.y - FRONTIER_VIEWPORT.height / 2))
        }
        cameraRef.current.x += (targetCamera.x - cameraRef.current.x) * Math.min(1, delta * 7)
        cameraRef.current.y += (targetCamera.y - cameraRef.current.y) * Math.min(1, delta * 7)
      }

      const shakeActive = now < shakeRef.current.until
      const shakeX = shakeActive ? (Math.random() - .5) * shakeRef.current.power * 2 : 0
      const shakeY = shakeActive ? (Math.random() - .5) * shakeRef.current.power * 2 : 0
      context.save()
      context.translate(shakeX, shakeY)
      drawStrategicMap(context, cameraRef.current, nodesRef.current, now, compactMode)
      nodesRef.current.forEach((node) => drawNode(context, node, cameraRef.current, now, contestedNodeRef.current === node.id))
      bulletsRef.current.forEach((bullet) => drawProjectile(context, bullet, cameraRef.current))
      hostileBulletsRef.current.forEach((bullet) => drawProjectile(context, bullet, cameraRef.current, true))
      enemiesRef.current.forEach((enemy) => drawEnemy(context, enemy, cameraRef.current, now))
      drawParticles(context, particlesRef.current, cameraRef.current)
      drawPlayer(context, playerRef.current, cameraRef.current, now)
      drawPlayerProtocol(context, playerRef.current, cameraRef.current, upgradesRef.current, now)
      context.restore()
      drawScreenTreatment(context, now, compactMode)
      drawWaypoint(context, playerRef.current, nodesRef.current, cameraRef.current)
      drawMinimap(context, playerRef.current, enemiesRef.current, nodesRef.current)
      drawCaptureCinematic(context, cinematicRef.current, cameraRef.current, now)

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
    const moveKeys = { w: 'up', W: 'up', ArrowUp: 'up', s: 'down', S: 'down', ArrowDown: 'down', a: 'left', A: 'left', ArrowLeft: 'left', d: 'right', D: 'right', ArrowRight: 'right' }
    const keyDown = (event) => {
      if (moveKeys[event.key]) { event.preventDefault(); setControl(moveKeys[event.key], true) }
      else if (event.code === 'Space') { event.preventDefault(); setControl('fire', true, true) }
      else if (event.key === 'Shift' || event.key.toLowerCase() === 'e') { event.preventDefault(); queueDash() }
      else if (event.key.toLowerCase() === 'p' && statusRef.current === 'running') { statusRef.current = 'paused'; inputRef.current.fire = false; setStatus('paused') }
      else if (event.key.toLowerCase() === 'p' && statusRef.current === 'paused') { statusRef.current = 'running'; setStatus('running'); wake() }
    }
    const keyUp = (event) => {
      if (moveKeys[event.key]) setControl(moveKeys[event.key], false)
      if (event.code === 'Space') setControl('fire', false)
    }
    const release = () => { inputRef.current = { ...inputRef.current, up: false, down: false, left: false, right: false, fire: false } }
    window.addEventListener('keydown', keyDown)
    window.addEventListener('keyup', keyUp)
    window.addEventListener('blur', release)
    return () => {
      window.removeEventListener('keydown', keyDown)
      window.removeEventListener('keyup', keyUp)
      window.removeEventListener('blur', release)
    }
  }, [queueDash, setControl, wake])

  useEffect(() => {
    const pauseHidden = () => {
      if (document.hidden && statusRef.current === 'running') {
        statusRef.current = 'paused'
        inputRef.current.fire = false
        setStatus('paused')
      }
    }
    document.addEventListener('visibilitychange', pauseHidden)
    return () => document.removeEventListener('visibilitychange', pauseHidden)
  }, [])

  useEffect(() => () => {
    window.clearTimeout(endTimerRef.current)
    audioRef.current?.close()
  }, [])

  const pointerPosition = (event) => {
    const rect = canvasRef.current.getBoundingClientRect()
    pointerRef.current = {
      x: (event.clientX - rect.left) / rect.width * FRONTIER_VIEWPORT.width,
      y: (event.clientY - rect.top) / rect.height * FRONTIER_VIEWPORT.height,
      inside: true
    }
  }

  const togglePause = () => {
    if (statusRef.current === 'ready' || statusRef.current === 'ended') startGame()
    else if (statusRef.current === 'paused') { statusRef.current = 'running'; setStatus('running'); wake() }
    else { statusRef.current = 'paused'; inputRef.current.fire = false; setStatus('paused') }
  }

  return (
    <section className="signal-frontier">
      <header className="frontier-status">
        <div className="frontier-health"><span>Integrity</span><i><b style={{ width: `${health}%` }} /></i><strong>{health}</strong></div>
        <div className="frontier-sector-count"><span>{capturedCount === 4 ? 'Return' : 'Sectors'}</span><strong>{capturedCount === 4 ? 'Center' : `${capturedCount}/4`}</strong></div>
        <button type="button" onClick={togglePause}>{status === 'running' ? 'Pause' : status === 'paused' ? 'Resume' : 'New mission'}</button>
      </header>

      <div className="frontier-stage">
        <div
          className="frontier-board"
          ref={boardRef}
          onPointerMove={pointerPosition}
          onPointerEnter={pointerPosition}
          onPointerLeave={() => { pointerRef.current.inside = false; inputRef.current.fire = false }}
          onPointerDown={(event) => { pointerPosition(event); setControl('fire', true, event.pointerType !== 'mouse') }}
          onPointerUp={() => setControl('fire', false)}
          onPointerCancel={() => setControl('fire', false)}
        >
          <canvas ref={canvasRef} aria-label={`Signal Frontier. Integrity ${health}. ${capturedCount} of 4 sectors secured.`} />

          {status !== 'running' ? (
            <div className="frontier-overlay">
              <h2>{status === 'paused' ? 'Paused' : status === 'ended' ? health > 0 ? 'Mission complete' : 'Mission over' : 'Signal Frontier'}</h2>
              <p>{status === 'ended'
                ? 'Discovery unlocked.'
                : '1 zone = 1 record'}</p>
              {status !== 'ended' ? <button type="button" onClick={status === 'paused' ? togglePause : startGame}>{status === 'paused' ? 'Continue' : 'Play'}</button> : null}
            </div>
          ) : null}
        </div>

        <div className="frontier-mobile-controls" aria-label="Signal Frontier controls">
          <div className="frontier-dpad">
            <button type="button" className="up" onPointerDown={() => setControl('up', true)} onPointerUp={() => setControl('up', false)} onPointerCancel={() => setControl('up', false)} aria-label="Move up">↑</button>
            <button type="button" className="left" onPointerDown={() => setControl('left', true)} onPointerUp={() => setControl('left', false)} onPointerCancel={() => setControl('left', false)} aria-label="Move left">←</button>
            <button type="button" className="down" onPointerDown={() => setControl('down', true)} onPointerUp={() => setControl('down', false)} onPointerCancel={() => setControl('down', false)} aria-label="Move down">↓</button>
            <button type="button" className="right" onPointerDown={() => setControl('right', true)} onPointerUp={() => setControl('right', false)} onPointerCancel={() => setControl('right', false)} aria-label="Move right">→</button>
          </div>
          <div className="frontier-actions">
            <button type="button" className="dash" disabled={!dashReady} onClick={queueDash}>Dash</button>
            <button type="button" className="fire" onPointerDown={() => setControl('fire', true, true)} onPointerUp={() => setControl('fire', false)} onPointerCancel={() => setControl('fire', false)}>Fire</button>
          </div>
        </div>
      </div>
    </section>
  )
}
