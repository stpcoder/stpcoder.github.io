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

export function getRealityVisualState(progress, stepCount = 4) {
  const safeStepCount = Math.max(1, Math.floor(stepCount) || 1)
  const clamped = Math.max(0, Math.min(1, Number(progress) || 0))
  const lastIndex = safeStepCount - 1
  const scaled = clamped * safeStepCount
  const segmentIndex = Math.min(lastIndex, Math.floor(scaled))
  const localProgress = segmentIndex === lastIndex
    ? Math.max(0, Math.min(1, scaled - segmentIndex))
    : scaled - segmentIndex

  if (segmentIndex === lastIndex) {
    return {
      progress: clamped,
      index: lastIndex,
      localProgress,
      stagePosition: lastIndex,
    }
  }

  // Hold each frame first, then use a long eased crossfade. Copy leads the
  // visual midpoint slightly so it never appears one beat after the image.
  const transitionStart = 0.2
  const transitionEnd = 0.98
  const rawTransition = Math.max(
    0,
    Math.min(1, (localProgress - transitionStart) / (transitionEnd - transitionStart)),
  )
  const easedTransition = rawTransition * rawTransition * (3 - 2 * rawTransition)

  return {
    progress: clamped,
    index: easedTransition >= 0.44 ? segmentIndex + 1 : segmentIndex,
    localProgress,
    stagePosition: segmentIndex + easedTransition,
  }
}
