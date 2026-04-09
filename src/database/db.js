/**
 * Niotic Database - SQLite via better-sqlite3
 */

import Database from 'better-sqlite3';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { mkdirSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DB_DIR = join(__dirname, '..', '..', 'data');
mkdirSync(DB_DIR, { recursive: true });
const DB_PATH = join(DB_DIR, 'niotic.db');

let db;

function getDb() {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    initTables();
  }
  return db;
}

function initTables() {
  getDb().exec(`
    CREATE TABLE IF NOT EXISTS guild_config (
      guild_id TEXT PRIMARY KEY,
      prefix TEXT DEFAULT '!',
      log_channel TEXT,
      muted_role TEXT,
      auto_role TEXT,
      welcome_channel TEXT,
      welcome_message TEXT,
      goodbye_channel TEXT,
      goodbye_message TEXT,
      shield_enabled INTEGER DEFAULT 1,
      anti_spam_enabled INTEGER DEFAULT 1,
      anti_raid_enabled INTEGER DEFAULT 1,
      auto_mod_enabled INTEGER DEFAULT 1,
      derank_threshold INTEGER DEFAULT 3,
      raid_threshold INTEGER DEFAULT 5,
      created_at INTEGER DEFAULT (strftime('%s', 'now'))
    );

    CREATE TABLE IF NOT EXISTS whitelist (
      guild_id TEXT,
      type TEXT,
      target_id TEXT,
      added_by TEXT,
      created_at INTEGER DEFAULT (strftime('%s', 'now')),
      PRIMARY KEY (guild_id, type, target_id)
    );

    CREATE TABLE IF NOT EXISTS warnings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      guild_id TEXT,
      user_id TEXT,
      reason TEXT,
      moderator_id TEXT,
      timestamp INTEGER DEFAULT (strftime('%s', 'now'))
    );

    CREATE TABLE IF NOT EXISTS logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      guild_id TEXT,
      action TEXT,
      user_id TEXT,
      moderator_id TEXT,
      reason TEXT,
      timestamp INTEGER DEFAULT (strftime('%s', 'now'))
    );

    CREATE TABLE IF NOT EXISTS violations (
      guild_id TEXT,
      user_id TEXT,
      points INTEGER DEFAULT 0,
      reasons TEXT DEFAULT '[]',
      last_update INTEGER DEFAULT (strftime('%s', 'now')),
      PRIMARY KEY (guild_id, user_id)
    );

    CREATE TABLE IF NOT EXISTS backups (
      id TEXT PRIMARY KEY,
      guild_id TEXT,
      data TEXT,
      created_at INTEGER DEFAULT (strftime('%s', 'now'))
    );

    CREATE TABLE IF NOT EXISTS raid_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      guild_id TEXT,
      type TEXT,
      triggered_by TEXT,
      channel_count INTEGER,
      timestamp INTEGER DEFAULT (strftime('%s', 'now'))
    );

    CREATE TABLE IF NOT EXISTS stats (
      guild_id TEXT,
      action TEXT,
      count INTEGER DEFAULT 0,
      PRIMARY KEY (guild_id, action)
    );
  `);
}

// Guild Config
export function getGuildConfig(guildId) {
  const row = getDb().prepare('SELECT * FROM guild_config WHERE guild_id = ?').get(guildId);
  if (!row) return {};
  return {
    prefix: row.prefix || '!',
    logChannel: row.log_channel,
    mutedRole: row.muted_role,
    autoRole: row.auto_role,
    welcomeChannel: row.welcome_channel,
    welcomeMessage: row.welcome_message,
    goodbyeChannel: row.goodbye_channel,
    goodbyeMessage: row.goodbye_message,
    shieldEnabled: row.shield_enabled !== 0,
    antiSpamEnabled: row.anti_spam_enabled !== 0,
    antiRaidEnabled: row.anti_raid_enabled !== 0,
    autoModEnabled: row.auto_mod_enabled !== 0,
    derankThreshold: row.derank_threshold || 3,
    raidThreshold: row.raid_threshold || 5,
  };
}

export async function updateGuildConfig(guildId, updates) {
  const existing = getDb().prepare('SELECT 1 FROM guild_config WHERE guild_id = ?').get(guildId);
  const fieldMap = {
    prefix: 'prefix', logChannel: 'log_channel', mutedRole: 'muted_role',
    autoRole: 'auto_role', welcomeChannel: 'welcome_channel', welcomeMessage: 'welcome_message',
    goodbyeChannel: 'goodbye_channel', goodbyeMessage: 'goodbye_message',
    shieldEnabled: 'shield_enabled', antiSpamEnabled: 'anti_spam_enabled',
    antiRaidEnabled: 'anti_raid_enabled', autoModEnabled: 'auto_mod_enabled',
    derankThreshold: 'derank_threshold', raidThreshold: 'raid_threshold',
  };

  if (existing) {
    const sets = [];
    const vals = [];
    for (const [key, value] of Object.entries(updates)) {
      const col = fieldMap[key];
      if (col) { sets.push(`${col} = ?`); vals.push(value); }
    }
    if (sets.length > 0) {
      vals.push(guildId);
      getDb().prepare(`UPDATE guild_config SET ${sets.join(', ')} WHERE guild_id = ?`).run(...vals);
    }
  } else {
    const cols = ['guild_id'];
    const ph = ['?'];
    const vals = [guildId];
    for (const [key, value] of Object.entries(updates)) {
      const col = fieldMap[key];
      if (col) { cols.push(col); ph.push('?'); vals.push(value); }
    }
    getDb().prepare(`INSERT INTO guild_config (${cols.join(', ')}) VALUES (${ph.join(', ')})`).run(...vals);
  }
}

// Whitelist
export function getWhitelist(guildId) {
  const rows = getDb().prepare('SELECT * FROM whitelist WHERE guild_id = ?').all(guildId);
  return {
    users: rows.filter(r => r.type === 'user').map(r => r.target_id),
    roles: rows.filter(r => r.type === 'role').map(r => r.target_id),
    channels: rows.filter(r => r.type === 'channel').map(r => r.target_id),
  };
}

export async function addToWhitelist(guildId, type, targetId, addedBy = 'system') {
  getDb().prepare('INSERT OR IGNORE INTO whitelist (guild_id, type, target_id, added_by) VALUES (?, ?, ?, ?)').run(guildId, type, targetId, addedBy);
}

export async function removeFromWhitelist(guildId, type, targetId) {
  getDb().prepare('DELETE FROM whitelist WHERE guild_id = ? AND type = ? AND target_id = ?').run(guildId, type, targetId);
}

// Warnings
export function addWarning(guildId, userId, data) {
  const info = getDb().prepare('INSERT INTO warnings (guild_id, user_id, reason, moderator_id) VALUES (?, ?, ?, ?)').run(guildId, userId, data.reason || '', data.moderator || 'unknown');
  return info.lastInsertRowid;
}

export function getWarnings(guildId, userId) {
  return getDb().prepare('SELECT * FROM warnings WHERE guild_id = ? AND user_id = ? ORDER BY timestamp DESC').all(guildId, userId);
}

export function clearWarnings(guildId, userId) {
  getDb().prepare('DELETE FROM warnings WHERE guild_id = ? AND user_id = ?').run(guildId, userId);
}

// Logs
export function addLog(guildId, data) {
  const info = getDb().prepare('INSERT INTO logs (guild_id, action, user_id, moderator_id, reason) VALUES (?, ?, ?, ?, ?)').run(guildId, data.action, data.userId || '', data.moderatorId || '', data.reason || '');
  getDb().prepare('INSERT INTO stats (guild_id, action, count) VALUES (?, ?, 1) ON CONFLICT(guild_id, action) DO UPDATE SET count = count + 1').run(guildId, data.action);
  return info.lastInsertRowid;
}

// Violations
export function addViolation(guildId, userId, points) {
  const existing = getDb().prepare('SELECT * FROM violations WHERE guild_id = ? AND user_id = ?').get(guildId, userId);
  if (existing) {
    getDb().prepare('UPDATE violations SET points = points + ?, last_update = ? WHERE guild_id = ? AND user_id = ?').run(points, Date.now(), guildId, userId);
  } else {
    getDb().prepare('INSERT INTO violations (guild_id, user_id, points) VALUES (?, ?, ?)').run(guildId, userId, points);
  }
}

export function getStats(guildId) {
  const rows = getDb().prepare('SELECT action, count FROM stats WHERE guild_id = ?').all(guildId);
  const result = { bans: 0, kicks: 0, mutes: 0, warns: 0, total: 0 };
  for (const r of rows) { result[r.action] = r.count; result.total += r.count; }
  return result;
}

// Backups
export function addBackup(guildId, backupData) {
  const id = `backup_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  getDb().prepare('INSERT INTO backups (id, guild_id, data) VALUES (?, ?, ?)').run(id, guildId, JSON.stringify(backupData));
  return id;
}

export function getBackup(id) {
  const row = getDb().prepare('SELECT * FROM backups WHERE id = ?').get(id);
  return row ? JSON.parse(row.data) : null;
}

// Raid Events
export function addRaidEvent(guildId, data) {
  getDb().prepare('INSERT INTO raid_events (guild_id, type, triggered_by, channel_count) VALUES (?, ?, ?, ?)').run(guildId, data.type, data.triggeredBy || '', data.channelCount || 0);
}

export function setDerankSanction(guildId, userId, sanction) {}
export function getDerankSanction(guildId, userId) { return null; }

export default {
  getGuildConfig, updateGuildConfig, getWhitelist, addToWhitelist, removeFromWhitelist,
  addWarning, getWarnings, clearWarnings, addLog, addViolation, getStats,
  addBackup, getBackup, addRaidEvent, setDerankSanction, getDerankSanction,
};
