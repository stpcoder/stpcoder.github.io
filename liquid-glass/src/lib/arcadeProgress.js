export function normalizeArcadeUnlocks(facts, storedIds, legacyBest = 0) {
  const validIds = new Set(facts.map(({ id }) => id))
  const saved = Array.isArray(storedIds)
    ? [...new Set(storedIds.filter((id) => validIds.has(id)))]
    : []

  if (saved.length) return saved

  const earned = Number.isFinite(Number(legacyBest)) ? Math.max(0, Number(legacyBest)) : 0
  return facts.slice(0, Math.min(earned, facts.length)).map(({ id }) => id)
}
