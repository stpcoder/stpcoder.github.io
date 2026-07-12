export const FRONTIER_VIEWPORT = { width: 960, height: 540 }
export const FRONTIER_WORLD = { width: 2400, height: 1600 }
export const FRONTIER_NEXUS = { x: 1200, y: 800, radius: 76 }

export const FRONTIER_NODE_BLUEPRINTS = [
  { id: 'foundation', x: 480, y: 350, label: 'Foundation', color: '#5eead4', protocol: 'aegis' },
  { id: 'systems', x: 1920, y: 340, label: 'Systems', color: '#60a5fa', protocol: 'twin' },
  { id: 'research', x: 1920, y: 1260, label: 'Research', color: '#f5c45b', protocol: 'overclock' },
  { id: 'impact', x: 470, y: 1250, label: 'Impact', color: '#fb7185', protocol: 'flux' }
]

export const FRONTIER_PROTOCOLS = {
  aegis: { label: 'Aegis repair', detail: 'Restores integrity over time' },
  twin: { label: 'Twin link', detail: 'Adds a second pulse cannon' },
  overclock: { label: 'Overclock', detail: 'Raises the weapon fire rate' },
  flux: { label: 'Flux drive', detail: 'Cuts dash recharge time' }
}

export const FRONTIER_ENEMY_STATS = {
  scout: { radius: 13, speed: 116, health: 1, damage: 12, score: 90, color: '#ff627d' },
  sentinel: { radius: 16, speed: 72, health: 3, damage: 15, score: 180, color: '#ffb45e' },
  brute: { radius: 22, speed: 52, health: 6, damage: 22, score: 320, color: '#d978ff' }
}

export function createFrontierNodes() {
  return FRONTIER_NODE_BLUEPRINTS.map((node) => ({ ...node, progress: 0, captured: false }))
}

export function createFrontierPlayer() {
  return {
    x: FRONTIER_NEXUS.x,
    y: FRONTIER_NEXUS.y + 120,
    radius: 17,
    angle: -Math.PI / 2,
    health: 100,
    invincibleUntil: 0
  }
}

export function getFrontierUpgrades(nodes) {
  return nodes.reduce((upgrades, node) => {
    if (node.captured && node.protocol) upgrades[node.protocol] = true
    return upgrades
  }, { aegis: false, twin: false, overclock: false, flux: false })
}

export function squaredDistance(a, b) {
  const dx = a.x - b.x
  const dy = a.y - b.y
  return dx * dx + dy * dy
}

export function circlesOverlap(a, b) {
  const radius = a.radius + b.radius
  return squaredDistance(a, b) < radius * radius
}

export function normalizeVector(x, y) {
  const length = Math.hypot(x, y)
  return length ? { x: x / length, y: y / length, length } : { x: 0, y: 0, length: 0 }
}

export function clampToFrontierWorld(entity, margin = 36) {
  return {
    ...entity,
    x: Math.max(margin, Math.min(FRONTIER_WORLD.width - margin, entity.x)),
    y: Math.max(margin, Math.min(FRONTIER_WORLD.height - margin, entity.y))
  }
}

export function advanceNodeCapture(node, player, contested, deltaSeconds) {
  if (node.captured) return node
  const inside = squaredDistance(node, player) <= 92 * 92
  const rate = inside && !contested ? deltaSeconds / 2.7 : -deltaSeconds * (inside ? .08 : .13)
  const progress = Math.max(0, Math.min(1, node.progress + rate))
  return { ...node, progress, captured: progress >= 1 }
}

export function chooseEnemyType(capturedCount, random = Math.random) {
  const roll = random()
  if (capturedCount >= 3 && roll > .72) return 'brute'
  if (capturedCount >= 1 && roll > .46) return 'sentinel'
  return 'scout'
}
