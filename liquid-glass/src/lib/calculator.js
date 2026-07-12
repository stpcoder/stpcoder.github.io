export const CALCULATOR_INITIAL = { display: '0', stored: null, operator: null, waiting: false }

export function formatCalculator(value) {
  if (!Number.isFinite(value)) return 'Error'
  const precise = Number(value.toPrecision(10))
  const text = String(precise)
  return text.length > 12 ? precise.toExponential(6) : text
}

export function calculateValue(left, right, operator) {
  if (operator === '+') return left + right
  if (operator === '−') return left - right
  if (operator === '×') return left * right
  if (operator === '÷') return right === 0 ? Number.NaN : left / right
  return right
}

export function pressCalculatorKey(current, key) {
  if (/^\d$/.test(key)) {
    const display = current.waiting || current.display === '0' || current.display === 'Error'
      ? key
      : `${current.display}${key}`.slice(0, 12)
    return { ...current, display, waiting: false }
  }
  if (key === '.') {
    if (current.waiting || current.display === 'Error') return { ...current, display: '0.', waiting: false }
    return current.display.includes('.') ? current : { ...current, display: `${current.display}.` }
  }
  if (key === 'AC') return { ...CALCULATOR_INITIAL }
  if (key === 'backspace') {
    if (current.waiting) return current
    const display = current.display.length > 1 ? current.display.slice(0, -1) : '0'
    return { ...current, display }
  }
  if (key === '+/-') return { ...current, display: formatCalculator(-Number(current.display)) }
  if (key === '%') return { ...current, display: formatCalculator(Number(current.display) / 100) }
  if (['+', '−', '×', '÷'].includes(key)) {
    const value = Number(current.display)
    const stored = current.operator && current.stored !== null && !current.waiting
      ? calculateValue(current.stored, value, current.operator)
      : value
    return { display: formatCalculator(stored), stored, operator: key, waiting: true }
  }
  if (key === '=' && current.operator && current.stored !== null) {
    const result = calculateValue(current.stored, Number(current.display), current.operator)
    return { display: formatCalculator(result), stored: null, operator: null, waiting: true }
  }
  return current
}
