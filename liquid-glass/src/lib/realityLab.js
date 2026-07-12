export function normalizeRealityStoryIndex(index, total) {
  if (!Number.isFinite(total) || total <= 0) return 0
  return ((index % total) + total) % total
}

export function getRealityJourneyState(progress, stepCount = 4) {
  const safeStepCount = Math.max(1, Math.floor(stepCount) || 1)
  const clamped = Math.max(0, Math.min(1, Number(progress) || 0))
  const scaled = clamped * safeStepCount
  const index = Math.min(safeStepCount - 1, Math.floor(scaled))

  return {
    progress: clamped,
    index,
    localProgress: Math.max(0, Math.min(1, scaled - index)),
  }
}
