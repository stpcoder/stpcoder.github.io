export function normalizeArcadeUnlocks(facts, storedIds, legacyBest = 0) {
  const validIds = new Set(facts.map(({ id }) => id))
  const saved = Array.isArray(storedIds)
    ? [...new Set(storedIds.filter((id) => validIds.has(id)))]
    : []

  if (saved.length) return saved

  const earned = Number.isFinite(Number(legacyBest)) ? Math.max(0, Number(legacyBest)) : 0
  return facts.slice(0, Math.min(earned, facts.length)).map(({ id }) => id)
}

export function normalizeArcadeSessionResult(newIds, seenIds) {
  const recordIds = Array.isArray(seenIds) ? [...new Set(seenIds)] : []
  const reached = new Set(recordIds)
  const normalizedNewIds = Array.isArray(newIds)
    ? [...new Set(newIds.filter((id) => reached.has(id)))]
    : []

  return { newIds: normalizedNewIds, recordIds }
}
