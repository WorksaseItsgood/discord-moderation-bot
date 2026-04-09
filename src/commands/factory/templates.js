/**
 * Command Templates - Add templates here to auto-generate commands
 * Run: node generate.js
 */

export const templates = [
  // Moderation
  { name: 'kick', category: 'moderation', emoji: '🦶', action: 'kick' },
  { name: 'mute', category: 'moderation', emoji: '🔇', action: 'mute' },
  { name: 'unmute', category: 'moderation', emoji: '🔊', action: 'unmute' },
  { name: 'warn', category: 'moderation', emoji: '⚠️', action: 'warn' },
  { name: 'warns', category: 'moderation', emoji: '📋', action: 'warns' },
  { name: 'clearwarns', category: 'moderation', emoji: '🧹', action: 'clearwarns' },
  { name: 'tempban', category: 'moderation', emoji: '⏱️', action: 'tempban' },
  { name: 'softban', category: 'moderation', emoji: '💨', action: 'softban' },
  { name: 'clear', category: 'moderation', emoji: '🗑️', action: 'clear' },
  { name: 'lock', category: 'moderation', emoji: '🔒', action: 'lock' },
  { name: 'unlock', category: 'moderation', emoji: '🔓', action: 'unlock' },
  { name: 'slowmode', category: 'moderation', emoji: '🐌', action: 'slowmode' },
  { name: 'giverole', category: 'moderation', emoji: '🎭', action: 'giverole' },
  { name: 'takerole', category: 'moderation', emoji: '🎭', action: 'takerole' },
  { name: 'hackban', category: 'moderation', emoji: '🔨', action: 'hackban' },
  { name: 'purge', category: 'moderation', emoji: '🗑️', action: 'purge' },

  // Info
  { name: 'userinfo', category: 'info', emoji: '👤', action: 'userinfo' },
  { name: 'serverinfo', category: 'info', emoji: '🏠', action: 'serverinfo' },
  { name: 'roleinfo', category: 'info', emoji: '🏷️', action: 'roleinfo' },
  { name: 'channelinfo', category: 'info', emoji: '📁', action: 'channelinfo' },
  { name: 'permissions', category: 'info', emoji: '🔑', action: 'permissions' },
  { name: 'avlookup', category: 'info', emoji: '🖼️', action: 'avlookup' },

  // Utility
  { name: 'poll', category: 'utility', emoji: '📊', action: 'poll' },
  { name: 'vote', category: 'utility', emoji: '🗳️', action: 'vote' },
  { name: 'embed', category: 'utility', emoji: '📝', action: 'embed' },
  { name: 'say', category: 'utility', emoji: '💬', action: 'say' },

  // Config
  { name: 'config', category: 'config', emoji: '⚙️', action: 'config' },
  { name: 'setlogs', category: 'config', emoji: '📜', action: 'setlogs' },
  { name: 'setprefix', category: 'config', emoji: '📌', action: 'setprefix' },
  { name: 'setmutedrole', category: 'config', emoji: '🔇', action: 'setmutedrole' },
  { name: 'setraidconfig', category: 'config', emoji: '🛡️', action: 'setraidconfig' },
  { name: 'setantispam', category: 'config', emoji: '🛡️', action: 'setantispam' },
  { name: 'setderank', category: 'config', emoji: '⚠️', action: 'setderank' },
  { name: 'addwhitelist', category: 'config', emoji: '✅', action: 'addwhitelist' },
  { name: 'removewhitelist', category: 'config', emoji: '❌', action: 'removewhitelist' },
  { name: 'whitelist', category: 'config', emoji: '📋', action: 'whitelist' },
  { name: 'autorole', category: 'automation', emoji: '🎭', action: 'autorole' },
  { name: 'welcome', category: 'automation', emoji: '👋', action: 'welcome' },
  { name: 'goodbye', category: 'automation', emoji: '👋', action: 'goodbye' },
  { name: 'backup', category: 'automation', emoji: '💾', action: 'backup' },
  { name: 'settings', category: 'automation', emoji: '⚙️', action: 'settings' },
  { name: 'shield', category: 'protection', emoji: '🛡️', action: 'shield' },
  { name: 'raidmode', category: 'protection', emoji: '🚨', action: 'raidmode' },
  { name: 'lockdown', category: 'protection', emoji: '🔒', action: 'lockdown' },
  { name: 'unquakeserver', category: 'protection', emoji: '🔓', action: 'unquakeserver' },
  { name: 'stats', category: 'stats', emoji: '📊', action: 'stats' },
  { name: 'leaderboard', category: 'stats', emoji: '🏆', action: 'leaderboard' },
  { name: 'ping', category: 'info', emoji: '🏓', action: 'ping' },
  { name: 'uptime', category: 'info', emoji: '⏰', action: 'uptime' },
  { name: 'dashboard', category: 'config', emoji: '🛠️', action: 'dashboard' },
];
