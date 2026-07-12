import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
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
import { normalizeArcadeSessionResult, normalizeArcadeUnlocks } from '../src/lib/arcadeProgress.js'
import { getMineNeighbors, revealMineCells, seedMineBoard } from '../src/lib/minesweeperGame.js'
import {
  advanceNodeCapture,
  chooseEnemyType,
  circlesOverlap,
  clampToFrontierWorld,
  createFrontierNodes,
  getFrontierUpgrades
} from '../src/lib/signalFrontierGame.js'
import { CALCULATOR_INITIAL, pressCalculatorKey } from '../src/lib/calculator.js'
import { CORE_COMMANDS, getCommandManual } from '../src/lib/terminalCommandCatalog.js'
import {
  getLiquidRenderBudget,
  getLiquidTransmissionScale,
  lowerLiquidDpr,
  raiseLiquidDpr
} from '../src/lib/liquidRenderBudget.js'

const pathCases = [
  ['../', `${SHELL_HOME}/education`, SHELL_HOME],
  ['../../', `${SHELL_HOME}/education`, shellDirname(SHELL_HOME)],
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
assert.equal(CORE_COMMANDS.includes('vi'), true)
assert.equal(CORE_COMMANDS.includes('sw_vers'), true)
assert.equal(CORE_COMMANDS.includes('free'), false)
assert.equal(getCommandManual('vi').synopsis, 'vi [file]')
const desktopLiquidBudget = getLiquidRenderBudget({
  reducedGraphics: false,
  isMobile: false,
  devicePixelRatio: 2,
  viewportWidth: 1920,
  viewportHeight: 1080
})
assert.equal(desktopLiquidBudget.mode, 'full')
assert.equal(desktopLiquidBudget.targetFps, 30)
assert.equal(desktopLiquidBudget.antialias, true)
assert.equal(desktopLiquidBudget.initialDpr, 1.389)
assert.equal(getLiquidTransmissionScale(desktopLiquidBudget, desktopLiquidBudget.initialDpr), 0.612)

const mobileLiquidBudget = getLiquidRenderBudget({
  reducedGraphics: true,
  isMobile: true,
  devicePixelRatio: 3,
  viewportWidth: 390,
  viewportHeight: 844
})
assert.equal(mobileLiquidBudget.mode, 'efficient')
assert.equal(mobileLiquidBudget.targetFps, 30)
assert.equal(mobileLiquidBudget.antialias, false)
assert.equal(mobileLiquidBudget.initialDpr, 1.743)
assert.equal(getLiquidTransmissionScale(mobileLiquidBudget, mobileLiquidBudget.initialDpr), 0.806)
assert.equal(
  getLiquidRenderBudget({ reducedGraphics: false, isMobile: true }).mode,
  'full',
  'manual Full mode must remain available on mobile'
)
const fourKLiquidBudget = getLiquidRenderBudget({
  reducedGraphics: true,
  isMobile: false,
  devicePixelRatio: 2,
  viewportWidth: 3840,
  viewportHeight: 2160
})
assert.equal(fourKLiquidBudget.viewportPixels * fourKLiquidBudget.initialDpr ** 2 <= 3_050_000, true)
assert.equal(lowerLiquidDpr(1.25, 1), 1.125)
assert.equal(lowerLiquidDpr(0.8, 0.75), 0.75)
assert.equal(raiseLiquidDpr(0.75, 1), 0.875)
assert.equal(raiseLiquidDpr(0.95, 1), 1)

const minesStyles = readFileSync(new URL('../src/components/games/ArcadeMinesweeper.css', import.meta.url), 'utf8')
const minesView = readFileSync(new URL('../src/components/games/ArcadeMinesweeper.jsx', import.meta.url), 'utf8')
const terminalStyles = readFileSync(new URL('../src/components/styles/TerminalView.css', import.meta.url), 'utf8')
const macosView = readFileSync(new URL('../src/components/styles/MacOSDesktopView.jsx', import.meta.url), 'utf8')
const liquidCanvas = readFileSync(new URL('../src/components/LiquidSceneCanvas.jsx', import.meta.url), 'utf8')
const liquidScene = readFileSync(new URL('../src/components/Scene.jsx', import.meta.url), 'utf8')
const appStyles = readFileSync(new URL('../src/App.css', import.meta.url), 'utf8')
assert.match(minesStyles, /grid-template-rows:\s*repeat\(10,\s*minmax\(0,\s*1fr\)\)/)
assert.match(minesStyles, /\.mines-board\s*>\s*button[^}]+contain:\s*strict/s)
assert.match(minesView, />⛏️<\/button>/)
assert.match(minesView, />🚩<\/button>/)
assert.match(minesView, /className="mines-guide"/)
assert.match(minesView, /Right-click, long-press, or use Flag mode/)
assert.doesNotMatch(minesView, /Best|safe\s*<|Field in progress/)
assert.match(terminalStyles, /\.shell-prompt-line,[\s\S]+min-height:\s*1\.55em/)
assert.match(macosView, /function buildMenus/)
assert.match(macosView, /inert=\{minimized \? true : undefined\}/)
assert.match(macosView, /showAllWindows/)
assert.match(macosView, /<MotionConfig reducedMotion="user">/)
assert.equal(existsSync(new URL('../src/components/styles/EditorialView.jsx', import.meta.url)), false)
assert.match(liquidCanvas, /transmissionResolutionScale/)
assert.match(liquidCanvas, /requestAnimationFrame/)
assert.match(liquidCanvas, /sessionStorage/)
assert.match(liquidScene, /side:\s*THREE\.FrontSide/)
assert.doesNotMatch(liquidScene, /THREE\.DoubleSide|reducedGraphics/)
assert.doesNotMatch(appStyles, /\.neon-glow|\.light-streak/)

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
assert.deepEqual(
  normalizeArcadeSessionResult(['new', 'missing', 'new'], ['new', 'revisited', 'new']),
  { newIds: ['new'], recordIds: ['new', 'revisited'] }
)

const firstCell = 44
const mineBoard = seedMineBoard(10, 14, firstCell, () => .5)
assert.equal(mineBoard.filter(({ mine }) => mine).length, 14)
assert.equal(mineBoard[firstCell].mine, false)
getMineNeighbors(firstCell, 10).forEach((index) => assert.equal(mineBoard[index].mine, false))
const revealed = revealMineCells(mineBoard, firstCell, 10)
assert.equal(revealed[firstCell].open, true)
assert.equal(revealed.some(({ mine, open }) => mine && open), false)

const frontierNodes = createFrontierNodes()
assert.deepEqual(frontierNodes.flatMap(({ sections }) => sections), ['education', 'scholarships', 'experience', 'projects', 'awards', 'media', 'activities'])
const foundation = frontierNodes[0]
const capturing = advanceNodeCapture(foundation, { x: foundation.x, y: foundation.y }, false, 1)
assert.equal(capturing.progress > 0, true)
const contested = advanceNodeCapture({ ...foundation, progress: .5 }, { x: foundation.x, y: foundation.y }, true, 1)
assert.equal(contested.progress < .5, true)
assert.equal(circlesOverlap({ x: 0, y: 0, radius: 10 }, { x: 19, y: 0, radius: 10 }), true)
assert.equal(circlesOverlap({ x: 0, y: 0, radius: 10 }, { x: 20, y: 0, radius: 10 }), false)
assert.deepEqual(clampToFrontierWorld({ x: -20, y: 5000 }, 40), { x: 40, y: 1560 })
assert.equal(chooseEnemyType(0, () => .99), 'scout')
assert.equal(chooseEnemyType(2, () => .8), 'sentinel')
assert.equal(chooseEnemyType(4, () => .8), 'brute')
assert.equal(getFrontierUpgrades([{ protocol: 'twin', captured: true }]).twin, true)

let calculator = { ...CALCULATOR_INITIAL }
for (const key of ['2', '+', '3', '=']) calculator = pressCalculatorKey(calculator, key)
assert.equal(calculator.display, '5')
calculator = { ...CALCULATOR_INITIAL }
for (const key of ['9', '÷', '0', '=']) calculator = pressCalculatorKey(calculator, key)
assert.equal(calculator.display, 'Error')

console.log('interaction regression checks passed')
