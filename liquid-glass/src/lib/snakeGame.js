export const SNAKE_DIRECTIONS = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 }
}

export function stepSnake(snake, direction, fruit, gridSize) {
  const movement = SNAKE_DIRECTIONS[direction]
  if (!movement || !snake.length) return { snake, ateFruit: false, collision: true }

  const head = { x: snake[0].x + movement.x, y: snake[0].y + movement.y }
  const ateFruit = head.x === fruit.x && head.y === fruit.y
  const collisionBody = ateFruit ? snake : snake.slice(0, -1)
  const hitWall = head.x < 0 || head.x >= gridSize || head.y < 0 || head.y >= gridSize
  const hitBody = collisionBody.some((cell) => cell.x === head.x && cell.y === head.y)

  if (hitWall || hitBody) return { snake, ateFruit, collision: true }
  return {
    snake: ateFruit ? [head, ...snake] : [head, ...snake.slice(0, -1)],
    ateFruit,
    collision: false
  }
}
