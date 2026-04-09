/**
 * Derank Handler
 */

export function setupDerankHandler(client) {
  client.violationScores = new Map();
  client.logger.info('[DerankHandler] Initialized');
}

export async function addViolationScore(guildId, userId, points, reason, client) {
  if (!client.violationScores.has(guildId)) {
    client.violationScores.set(guildId, new Map());
  }
  const guildViolations = client.violationScores.get(guildId);
  const current = guildViolations.get(userId) || { points: 0, reasons: [] };
  current.points += points;
  current.reasons.push({ reason, points, timestamp: Date.now() });
  guildViolations.set(userId, current);

  const { addViolation } = await import('../database/db.js').catch(() => ({ addViolation: () => {} }));
  try { await addViolation(guildId, userId, points); } catch {}

  return current;
}
