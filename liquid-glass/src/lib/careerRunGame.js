export const RUN_VIEWPORT = { width: 900, height: 500 }
export const RUN_GROUND_Y = 410
export const RUN_WORLD_WIDTH = 4300
export const RUN_FINISH_X = 4180

export const RUN_OBSTACLES = [
  { x: 470, w: 42, h: 54, type: 'barrier' },
  { x: 850, w: 58, h: 72, type: 'server' },
  { x: 1080, w: 42, h: 44, type: 'crate' },
  { x: 1480, w: 72, h: 58, type: 'server' },
  { x: 1810, w: 42, h: 82, type: 'barrier' },
  { x: 2070, w: 46, h: 48, type: 'crate' },
  { x: 2510, w: 82, h: 66, type: 'server' },
  { x: 2810, w: 40, h: 92, type: 'barrier' },
  { x: 3330, w: 55, h: 52, type: 'crate' },
  { x: 3610, w: 86, h: 76, type: 'server' },
  { x: 3950, w: 42, h: 62, type: 'barrier' }
]

export const RUN_CHECKPOINTS = [
  { x: 640, label: 'Foundation' },
  { x: 1320, label: 'Build' },
  { x: 2260, label: 'Research' },
  { x: 3160, label: 'Impact' },
  { x: 3860, label: 'Milestone' }
]

export function rectanglesOverlap(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y
}

export function createCareerRunner() {
  return { x: 90, y: RUN_GROUND_Y - 52, w: 34, h: 52, vx: 0, vy: 0, onGround: true }
}

export function stepCareerRunner(player, controls, deltaSeconds) {
  const delta = Math.min(.034, Math.max(0, deltaSeconds))
  const direction = Number(Boolean(controls.right)) - Number(Boolean(controls.left))
  const targetVelocity = direction * 255
  const next = { ...player }
  const previousBottom = player.y + player.h

  next.vx += (targetVelocity - next.vx) * Math.min(1, delta * 11)
  if (!direction && Math.abs(next.vx) < 2) next.vx = 0
  next.vy += 1450 * delta
  next.x = Math.max(0, Math.min(RUN_WORLD_WIDTH - next.w, next.x + next.vx * delta))
  next.y += next.vy * delta
  next.onGround = false

  let collision = null
  for (const obstacle of RUN_OBSTACLES) {
    const rect = { x: obstacle.x, y: RUN_GROUND_Y - obstacle.h, w: obstacle.w, h: obstacle.h }
    if (!rectanglesOverlap(next, rect)) continue

    const landing = next.vy >= 0 && previousBottom <= rect.y + 6
    if (landing) {
      next.y = rect.y - next.h
      next.vy = 0
      next.onGround = true
    } else {
      collision = obstacle
      break
    }
  }

  if (next.y + next.h >= RUN_GROUND_Y) {
    next.y = RUN_GROUND_Y - next.h
    next.vy = 0
    next.onGround = true
  }

  return { player: next, collision }
}
