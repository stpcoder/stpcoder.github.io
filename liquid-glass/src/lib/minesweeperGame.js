export function createEmptyMineBoard(size) {
  return Array.from({ length: size * size }, (_, index) => ({ index, mine: false, open: false, flagged: false, nearby: 0 }))
}

export function getMineNeighbors(index, size) {
  const x = index % size
  const y = Math.floor(index / size)
  const result = []

  for (let dy = -1; dy <= 1; dy += 1) {
    for (let dx = -1; dx <= 1; dx += 1) {
      const nextX = x + dx
      const nextY = y + dy
      if ((dx || dy) && nextX >= 0 && nextX < size && nextY >= 0 && nextY < size) result.push(nextY * size + nextX)
    }
  }

  return result
}

export function seedMineBoard(size, mineCount, firstIndex, random = Math.random) {
  const board = createEmptyMineBoard(size)
  const excluded = new Set([firstIndex, ...getMineNeighbors(firstIndex, size)])
  const candidates = board.map(({ index }) => index).filter((index) => !excluded.has(index))

  for (let index = candidates.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1))
    ;[candidates[index], candidates[swapIndex]] = [candidates[swapIndex], candidates[index]]
  }

  candidates.slice(0, mineCount).forEach((index) => { board[index].mine = true })
  board.forEach((cell) => { cell.nearby = getMineNeighbors(cell.index, size).filter((index) => board[index].mine).length })
  return board
}

export function revealMineCells(source, startIndex, size) {
  const board = source.map((cell) => ({ ...cell }))
  const queue = [startIndex]
  const seen = new Set()
  let cursor = 0

  while (cursor < queue.length) {
    const index = queue[cursor]
    cursor += 1
    if (seen.has(index) || board[index].flagged || board[index].mine) continue
    seen.add(index)
    board[index].open = true
    if (board[index].nearby === 0) getMineNeighbors(index, size).forEach((neighbor) => queue.push(neighbor))
  }

  return board
}
