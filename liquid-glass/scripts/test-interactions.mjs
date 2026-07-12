import assert from 'node:assert/strict'
import {
  expandShellAlias,
  normalizeShellPath,
  SHELL_HOME,
  shellBasename,
  shellDirname,
  shellDisplayPath,
  splitPipeline,
  tokenizeShell
} from '../src/lib/portfolioShell.js'
import { stepSnake } from '../src/lib/snakeGame.js'
import { normalizeArcadeUnlocks } from '../src/lib/arcadeProgress.js'
import { getMineNeighbors, revealMineCells, seedMineBoard } from '../src/lib/minesweeperGame.js'
import { createCareerRunner, rectanglesOverlap, RUN_GROUND_Y, stepCareerRunner } from '../src/lib/careerRunGame.js'
import { CALCULATOR_INITIAL, pressCalculatorKey } from '../src/lib/calculator.js'

const pathCases = [
  ['../', `${SHELL_HOME}/education`, SHELL_HOME],
  ['../../', `${SHELL_HOME}/education`, '/home'],
  ['./projects', SHELL_HOME, `${SHELL_HOME}/projects`],
  ['~/media', '/tmp', `${SHELL_HOME}/media`],
  ['/', `${SHELL_HOME}/projects`, '/'],
  ['../../../..', `${SHELL_HOME}/education`, '/']
]

for (const [input, cwd, expected] of pathCases) {
  assert.equal(normalizeShellPath(input, cwd), expected, `${input} from ${cwd}`)
}

assert.equal(shellDisplayPath(`${SHELL_HOME}/education`), '~/education')
assert.equal(shellBasename(`${SHELL_HOME}/about.txt`), 'about.txt')
assert.equal(shellDirname(`${SHELL_HOME}/about.txt`), SHELL_HOME)
assert.equal(expandShellAlias('ll ../'), 'ls -la ../')
assert.equal(expandShellAlias('la'), 'ls -a')
assert.deepEqual(tokenizeShell(`grep -i "dram ae" about.txt`), ['grep', '-i', 'dram ae', 'about.txt'])
assert.deepEqual(splitPipeline(`cat about.txt | grep "SK hynix" | head -1`), ['cat about.txt', 'grep "SK hynix"', 'head -1'])

const moved = stepSnake([{ x: 2, y: 2 }, { x: 1, y: 2 }], 'right', { x: 4, y: 4 }, 5)
assert.equal(moved.collision, false)
assert.deepEqual(moved.snake, [{ x: 3, y: 2 }, { x: 2, y: 2 }])

const ate = stepSnake([{ x: 2, y: 2 }, { x: 1, y: 2 }], 'right', { x: 3, y: 2 }, 5)
assert.equal(ate.ateFruit, true)
assert.equal(ate.snake.length, 3)

const wall = stepSnake([{ x: 4, y: 2 }], 'right', { x: 0, y: 0 }, 5)
assert.equal(wall.collision, true)

const facts = [{ id: 'a' }, { id: 'b' }, { id: 'c' }]
assert.deepEqual(normalizeArcadeUnlocks(facts, [], 2), ['a', 'b'])
assert.deepEqual(normalizeArcadeUnlocks(facts, ['b', 'missing', 'b'], 3), ['b'])

const firstCell = 44
const mineBoard = seedMineBoard(10, 14, firstCell, () => .5)
assert.equal(mineBoard.filter(({ mine }) => mine).length, 14)
assert.equal(mineBoard[firstCell].mine, false)
getMineNeighbors(firstCell, 10).forEach((index) => assert.equal(mineBoard[index].mine, false))
const revealed = revealMineCells(mineBoard, firstCell, 10)
assert.equal(revealed[firstCell].open, true)
assert.equal(revealed.some(({ mine, open }) => mine && open), false)

const runner = createCareerRunner()
const runnerStep = stepCareerRunner(runner, { right: true, left: false }, .03)
assert.equal(runnerStep.player.x > runner.x, true)
assert.equal(runnerStep.player.y + runnerStep.player.h, RUN_GROUND_Y)
assert.equal(rectanglesOverlap({ x: 0, y: 0, w: 10, h: 10 }, { x: 9, y: 9, w: 10, h: 10 }), true)
assert.equal(rectanglesOverlap({ x: 0, y: 0, w: 10, h: 10 }, { x: 10, y: 10, w: 10, h: 10 }), false)

let calculator = { ...CALCULATOR_INITIAL }
for (const key of ['2', '+', '3', '=']) calculator = pressCalculatorKey(calculator, key)
assert.equal(calculator.display, '5')
calculator = { ...CALCULATOR_INITIAL }
for (const key of ['9', '÷', '0', '=']) calculator = pressCalculatorKey(calculator, key)
assert.equal(calculator.display, 'Error')

console.log('interaction regression checks passed')
