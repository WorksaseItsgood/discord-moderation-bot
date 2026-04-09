/**
 * Raid Detector - Core Anti-Raid Engine
 * Tracks action counts per user per time window
 * Provides detection and recording of suspicious activities
 */

import { getRaidConfig } from '../database/db.js';

// In-memory tracker: { guildId: { userId: { actionType: [{timestamp, count}] } } }
const raidTracker = new Map();

// Cleanup interval (runs every 30 seconds)
const CLEANUP_INTERVAL = 30 * 1000;

/**
 * Initialize the raid detector
 */
export function setupRaidDetector(client) {
  // Initialize client maps if not exists
  client.raidTracker = client.raidTracker || new Map();
  
  // Start cleanup interval
  setInterval(() => {
    cleanupAllOldActions();
  }, CLEANUP_INTERVAL);
  
  console.log('[RaidDetector] Initialized');
}

/**
 * Check if user is whitelisted from raid detection
 */
function isUserWhitelisted(guildId, userId) {
  const config = getRaidConfig(guildId);
  if (!config) return false;
  
  // Check raid whitelist
  if (config.raidWhitelist?.includes(userId)) return true;
  // Check whitelist bypass (legacy)
  if (config.whitelistBypass?.includes(userId)) return true;
  
  return false;
}

/**
 * Check if a raid action threshold has been exceeded
 * @param {string} guildId - Guild ID
 * @param {string} userId - User ID (or 'global' for guild-wide)
 * @param {string} actionType - Type of action (channel_create, ban, kick, spam, etc.)
 * @param {number} threshold - Maximum allowed count
 * @param {number} windowSeconds - Time window in seconds
 * @returns {object} - { detected: boolean, count: number }
 */
export function checkRaidAction(guildId, userId, actionType, threshold, windowSeconds) {
  // Skip if user is whitelisted
  if (userId !== 'global' && isUserWhitelisted(guildId, userId)) {
    return { detected: false, count: 0, whitelisted: true };
  }
  
  // Initialize guild tracker if not exists
  if (!raidTracker.has(guildId)) {
    raidTracker.set(guildId, new Map());
  }
  
  const guildTracker = raidTracker.get(guildId);
  
  // Initialize user tracker if not exists
  if (!guildTracker.has(userId)) {
    guildTracker.set(userId, new Map());
  }
  
  const userTracker = guildTracker.get(userId);
  
  // Initialize action tracker if not exists
  if (!userTracker.has(actionType)) {
    userTracker.set(actionType, []);
  }
  
  const now = Date.now();
  const actions = userTracker.get(actionType);
  
  // Clean old actions outside the window
  const validActions = actions.filter(a => now - a.timestamp < windowSeconds * 1000);
  userTracker.set(actionType, validActions);
  
  const count = validActions.length;
  
  // Check if threshold exceeded
  if (count >= threshold) {
    return { detected: true, count, threshold };
  }
  
  return { detected: false, count, threshold };
}

/**
 * Record a raid action
 * @param {string} guildId - Guild ID
 * @param {string} userId - User ID (or 'global' for guild-wide)
 * @param {string} actionType - Type of action
 * @param {number} count - Number of actions to record (default 1)
 */
export function recordRaidAction(guildId, userId, actionType, count = 1) {
  // Skip if user is whitelisted
  if (userId !== 'global' && isUserWhitelisted(guildId, userId)) {
    return;
  }
  
  // Initialize tracker
  if (!raidTracker.has(guildId)) {
    raidTracker.set(guildId, new Map());
  }
  
  const guildTracker = raidTracker.get(guildId);
  
  if (!guildTracker.has(userId)) {
    guildTracker.set(userId, new Map());
  }
  
  const userTracker = guildTracker.get(userId);
  
  if (!userTracker.has(actionType)) {
    userTracker.set(actionType, []);
  }
  
  const now = Date.now();
  const actions = userTracker.get(actionType);
  
  // Add new action entries
  for (let i = 0; i < count; i++) {
    actions.push({ timestamp: now, count: 1 });
  }
  
  userTracker.set(actionType, actions);
}

/**
 * Cleanup old actions for a specific user/action type
 * @param {string} guildId - Guild ID
 * @param {string} userId - User ID
 * @param {string} actionType - Type of action
 * @param {number} windowSeconds - Time window in seconds
 */
export function cleanupOldActions(guildId, userId, actionType, windowSeconds) {
  if (!raidTracker.has(guildId)) return;
  
  const guildTracker = raidTracker.get(guildId);
  if (!guildTracker.has(userId)) return;
  
  const userTracker = guildTracker.get(userId);
  if (!userTracker.has(actionType)) return;
  
  const now = Date.now();
  const actions = userTracker.get(actionType);
  const validActions = actions.filter(a => now - a.timestamp < windowSeconds * 1000);
  
  userTracker.set(actionType, validActions);
}

/**
 * Cleanup all old actions from all trackers
 */
function cleanupAllOldActions() {
  const now = Date.now();
  const maxWindow = 600 * 1000; // 10 minutes max
  
  for (const [guildId, guildTracker] of raidTracker.entries()) {
    for (const [userId, userTracker] of guildTracker.entries()) {
      for (const [actionType, actions] of userTracker.entries()) {
        const validActions = actions.filter(a => now - a.timestamp < maxWindow);
        if (validActions.length === 0) {
          userTracker.delete(actionType);
        } else {
          userTracker.set(actionType, validActions);
        }
      }
      // Clean empty user trackers
      if (userTracker.size === 0) {
        guildTracker.delete(userId);
      }
    }
    // Clean empty guild trackers
    if (guildTracker.size === 0) {
      raidTracker.delete(guildId);
    }
  }
}

/**
 * Get current tracker stats for a user
 */
export function getUserTrackerStats(guildId, userId) {
  if (!raidTracker.has(guildId)) return {};
  if (!raidTracker.get(guildId).has(userId)) return {};
  
  const userTracker = raidTracker.get(guildId).get(userId);
  const stats = {};
  
  for (const [actionType, actions] of userTracker.entries()) {
    stats[actionType] = actions.length;
  }
  
  return stats;
}

/**
 * Clear all tracker data for a user
 */
export function clearUserTracker(guildId, userId) {
  if (!raidTracker.has(guildId)) return;
  raidTracker.get(guildId).delete(userId);
}

/**
 * Clear all tracker data for a guild
 */
export function clearGuildTracker(guildId) {
  raidTracker.delete(guildId);
}

/**
 * Get the raw tracker map (for debugging)
 */
export function getRaidTracker() {
  return raidTracker;
}

export default {
  setupRaidDetector,
  checkRaidAction,
  recordRaidAction,
  cleanupOldActions,
  getUserTrackerStats,
  clearUserTracker,
  clearGuildTracker,
  getRaidTracker,
};
