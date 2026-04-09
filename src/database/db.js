/**
 * Niotic Database - SQLite via better-sqlite3
 * Enhanced with Anti-Raid System tables
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
      mod_log_channel TEXT,
      server_log_channel TEXT,
      message_log_channel TEXT,
      raid_log_channel TEXT,
      voice_log_channel TEXT,
      role_log_channel TEXT,
      log_level TEXT DEFAULT 'normal',
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
      raid_lock_duration INTEGER DEFAULT 15,
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
      user_id TEXT,
      action_type TEXT,
      count INTEGER DEFAULT 1,
      timestamp INTEGER DEFAULT (strftime('%s', 'now')),
      raw_data TEXT
    );
    CREATE TABLE IF NOT EXISTS raid_action_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      guild_id TEXT,
      type TEXT,
      triggered_by TEXT,
      target_id TEXT,
      reason TEXT,
      threshold INTEGER,
      join_speed TEXT,
      count INTEGER,
      duration INTEGER,
      timestamp INTEGER DEFAULT (strftime('%s', 'now'))
    );

    CREATE TABLE IF NOT EXISTS stats (
      guild_id TEXT,
      action TEXT,
      count INTEGER DEFAULT 0,
      PRIMARY KEY (guild_id, action)
    );

    -- ============== ANTI-RAID TABLES ==============
    CREATE TABLE IF NOT EXISTS raid_config (
      guild_id TEXT PRIMARY KEY,
      anti_bot_enabled INTEGER DEFAULT 0,
      anti_bot_whitelist TEXT DEFAULT '[]',
      channel_create_threshold INTEGER DEFAULT 10,
      channel_create_window_minutes INTEGER DEFAULT 1,
      channel_delete_threshold INTEGER DEFAULT 10,
      channel_delete_window_minutes INTEGER DEFAULT 1,
      mass_ban_threshold INTEGER DEFAULT 5,
      mass_ban_window_minutes INTEGER DEFAULT 2,
      mass_kick_threshold INTEGER DEFAULT 5,
      mass_kick_window_minutes INTEGER DEFAULT 2,
      spam_threshold INTEGER DEFAULT 20,
      spam_window_seconds INTEGER DEFAULT 10,
      whitelist_bypass TEXT DEFAULT '[]',
      auto_derank_enabled INTEGER DEFAULT 1,
      dm_on_derank_enabled INTEGER DEFAULT 1,
      log_channel_id TEXT,
      created_at INTEGER DEFAULT (strftime('%s', 'now')),
      updated_at INTEGER DEFAULT (strftime('%s', 'now'))
    );

    CREATE TABLE IF NOT EXISTS raid_action_tracker (
      guild_id TEXT,
      user_id TEXT,
      action_type TEXT,
      count INTEGER DEFAULT 1,
      window_start INTEGER DEFAULT (strftime('%s', 'now')),
      PRIMARY KEY (guild_id, user_id, action_type)
    );
  `);
  
  // Migration: add new columns to existing tables
  try {
    const tableInfo = getDb().pragma('table_info(guild_config)');
    const columns = tableInfo.map(col => col.name);
    
    if (!columns.includes('log_level')) {
      getDb().exec('ALTER TABLE guild_config ADD COLUMN log_level TEXT DEFAULT "normal"');
    }
    if (!columns.includes('mod_log_channel')) {
      getDb().exec('ALTER TABLE guild_config ADD COLUMN mod_log_channel TEXT');
    }
    if (!columns.includes('server_log_channel')) {
      getDb().exec('ALTER TABLE guild_config ADD COLUMN server_log_channel TEXT');
    }
    if (!columns.includes('message_log_channel')) {
      getDb().exec('ALTER TABLE guild_config ADD COLUMN message_log_channel TEXT');
    }
    if (!columns.includes('raid_log_channel')) {
      getDb().exec('ALTER TABLE guild_config ADD COLUMN raid_log_channel TEXT');
    }
    if (!columns.includes('voice_log_channel')) {
      getDb().exec('ALTER TABLE guild_config ADD COLUMN voice_log_channel TEXT');
    }
    if (!columns.includes('role_log_channel')) {
      getDb().exec('ALTER TABLE guild_config ADD COLUMN role_log_channel TEXT');
    }
    if (!columns.includes('raid_lock_duration')) {
      getDb().exec('ALTER TABLE guild_config ADD COLUMN raid_lock_duration INTEGER DEFAULT 15');
    }
    // Anti-raid new columns
    if (!columns.includes('antiraid_enabled')) {
      getDb().exec('ALTER TABLE guild_config ADD COLUMN antiraid_enabled INTEGER DEFAULT 1');
    }
    if (!columns.includes('antibot_enabled')) {
      getDb().exec('ALTER TABLE guild_config ADD COLUMN antibot_enabled INTEGER DEFAULT 1');
    }
    if (!columns.includes('antibot_whitelist')) {
      getDb().exec('ALTER TABLE guild_config ADD COLUMN antibot_whitelist TEXT DEFAULT \'[]\'');
    }
    if (!columns.includes('raid_whitelist')) {
      getDb().exec('ALTER TABLE guild_config ADD COLUMN raid_whitelist TEXT DEFAULT \'[]\'');
    }
    if (!columns.includes('raid_channel_threshold')) {
      getDb().exec('ALTER TABLE guild_config ADD COLUMN raid_channel_threshold INTEGER DEFAULT 5');
    }
    if (!columns.includes('raid_channel_window')) {
      getDb().exec('ALTER TABLE guild_config ADD COLUMN raid_channel_window INTEGER DEFAULT 120');
    }
    if (!columns.includes('raid_delete_threshold')) {
      getDb().exec('ALTER TABLE guild_config ADD COLUMN raid_delete_threshold INTEGER DEFAULT 5');
    }
    if (!columns.includes('raid_delete_window')) {
      getDb().exec('ALTER TABLE guild_config ADD COLUMN raid_delete_window INTEGER DEFAULT 120');
    }
    if (!columns.includes('raid_ban_threshold')) {
      getDb().exec('ALTER TABLE guild_config ADD COLUMN raid_ban_threshold INTEGER DEFAULT 10');
    }
    if (!columns.includes('raid_ban_window')) {
      getDb().exec('ALTER TABLE guild_config ADD COLUMN raid_ban_window INTEGER DEFAULT 300');
    }
    if (!columns.includes('raid_kick_threshold')) {
      getDb().exec('ALTER TABLE guild_config ADD COLUMN raid_kick_threshold INTEGER DEFAULT 15');
    }
    if (!columns.includes('raid_kick_window')) {
      getDb().exec('ALTER TABLE guild_config ADD COLUMN raid_kick_window INTEGER DEFAULT 300');
    }
    if (!columns.includes('raid_spam_threshold')) {
      getDb().exec('ALTER TABLE guild_config ADD COLUMN raid_spam_threshold INTEGER DEFAULT 20');
    }
    if (!columns.includes('raid_spam_window')) {
      getDb().exec('ALTER TABLE guild_config ADD COLUMN raid_spam_window INTEGER DEFAULT 10');
    }
    if (!columns.includes('raid_derank_delay')) {
      getDb().exec('ALTER TABLE guild_config ADD COLUMN raid_derank_delay INTEGER DEFAULT 3');
    }
    if (!columns.includes('raid_dm_on_derank')) {
      getDb().exec('ALTER TABLE guild_config ADD COLUMN raid_dm_on_derank INTEGER DEFAULT 1');
    }
    if (!columns.includes('raid_log_channel')) {
      getDb().exec('ALTER TABLE guild_config ADD COLUMN raid_log_channel TEXT');
    }
  } catch (e) {
    // Columns may already exist
  }
}

// ============ RAID CONFIG FUNCTIONS ============

export function addRaidConfig(guildId) {
  const existing = getDb().prepare('SELECT 1 FROM raid_config WHERE guild_id = ?').get(guildId);
  if (!existing) {
    getDb().prepare(`
      INSERT INTO raid_config (guild_id) VALUES (?)
    `).run(guildId);
  }
  return getRaidConfig(guildId);
}

export function getRaidConfig(guildId) {
  let row = getDb().prepare('SELECT * FROM raid_config WHERE guild_id = ?').get(guildId);
  if (!row) {
    addRaidConfig(guildId);
    row = getDb().prepare('SELECT * FROM raid_config WHERE guild_id = ?').get(guildId);
  }
  return {
    guildId: row.guild_id,
    antiBotEnabled: !!row.anti_bot_enabled,
    antiBotWhitelist: JSON.parse(row.anti_bot_whitelist || '[]'),
    channelCreateThreshold: row.channel_create_threshold || 10,
    channelCreateWindowMinutes: row.channel_create_window_minutes || 1,
    channelDeleteThreshold: row.channel_delete_threshold || 10,
    channelDeleteWindowMinutes: row.channel_delete_window_minutes || 1,
    massBanThreshold: row.mass_ban_threshold || 5,
    massBanWindowMinutes: row.mass_ban_window_minutes || 2,
    massKickThreshold: row.mass_kick_threshold || 5,
    massKickWindowMinutes: row.mass_kick_window_minutes || 2,
    spamThreshold: row.spam_threshold || 20,
    spamWindowSeconds: row.spam_window_seconds || 10,
    whitelistBypass: JSON.parse(row.whitelist_bypass || '[]'),
    autoDerankEnabled: !!row.auto_derank_enabled,
    dmOnDerankEnabled: !!row.dm_on_derank_enabled,
    logChannelId: row.log_channel_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    // Additional raid thresholds from guild_config
    antiraidEnabled: row.antiraid_enabled !== undefined ? !!row.antiraid_enabled : true,
    antibotEnabled: row.antibot_enabled !== undefined ? !!row.antibot_enabled : true,
    antibotWhitelist: row.antibot_whitelist ? JSON.parse(row.antibot_whitelist) : [],
    raidWhitelist: row.raid_whitelist ? JSON.parse(row.raid_whitelist) : [],
    raidChannelThreshold: row.raid_channel_threshold || 5,
    raidChannelWindow: row.raid_channel_window || 120,
    raidDeleteThreshold: row.raid_delete_threshold || 5,
    raidDeleteWindow: row.raid_delete_window || 120,
    raidBanThreshold: row.raid_ban_threshold || 10,
    raidBanWindow: row.raid_ban_window || 300,
    raidKickThreshold: row.raid_kick_threshold || 15,
    raidKickWindow: row.raid_kick_window || 300,
    raidSpamThreshold: row.raid_spam_threshold || 20,
    raidSpamWindow: row.raid_spam_window || 10,
    raidDerankDelay: row.raid_derank_delay || 3,
    raidDmOnDerank: row.raid_dm_on_derank !== 0,
    raidLogChannel: row.raid_log_channel,
  };
}

export function updateRaidConfig(guildId, updates) {
  const fieldMap = {
    antiBotEnabled: 'anti_bot_enabled',
    antiBotWhitelist: 'anti_bot_whitelist',
    channelCreateThreshold: 'channel_create_threshold',
    channelCreateWindowMinutes: 'channel_create_window_minutes',
    channelDeleteThreshold: 'channel_delete_threshold',
    channelDeleteWindowMinutes: 'channel_delete_window_minutes',
    massBanThreshold: 'mass_ban_threshold',
    massBanWindowMinutes: 'mass_ban_window_minutes',
    massKickThreshold: 'mass_kick_threshold',
    massKickWindowMinutes: 'mass_kick_window_minutes',
    spamThreshold: 'spam_threshold',
    spamWindowSeconds: 'spam_window_seconds',
    whitelistBypass: 'whitelist_bypass',
    autoDerankEnabled: 'auto_derank_enabled',
    dmOnDerankEnabled: 'dm_on_derank_enabled',
    logChannelId: 'log_channel_id',
  };

  const sets = [];
  const vals = [];
  for (const [key, value] of Object.entries(updates)) {
    const col = fieldMap[key];
    if (col) {
      if (Array.isArray(value)) {
        sets.push(`${col} = ?`);
        vals.push(JSON.stringify(value));
      } else if (typeof value === 'boolean') {
        sets.push(`${col} = ?`);
        vals.push(value ? 1 : 0);
      } else {
        sets.push(`${col} = ?`);
        vals.push(value);
      }
    }
  }

  if (sets.length > 0) {
    sets.push('updated_at = ?');
    vals.push(Math.floor(Date.now() / 1000));
    vals.push(guildId);
    getDb().prepare(`UPDATE raid_config SET ${sets.join(', ')} WHERE guild_id = ?`).run(...vals);
  }

  // Also sync to guild_config for new fields
  const guildConfigFieldMap = {
    antiBotEnabled: 'antibot_enabled',
    antiBotWhitelist: 'antibot_whitelist',
    autoDerankEnabled: 'antiraid_enabled',
    dmOnDerankEnabled: 'raid_dm_on_derank',
    logChannelId: 'raid_log_channel',
    whitelistBypass: 'raid_whitelist',
  };

  const guildSets = [];
  const guildVals = [];
  for (const [key, value] of Object.entries(updates)) {
    const col = guildConfigFieldMap[key];
    if (col) {
      if (Array.isArray(value)) {
        guildSets.push(`${col} = ?`);
        guildVals.push(JSON.stringify(value));
      } else if (typeof value === 'boolean') {
        guildSets.push(`${col} = ?`);
        guildVals.push(value ? 1 : 0);
      } else {
        guildSets.push(`${col} = ?`);
        guildVals.push(value);
      }
    }
  }

  if (guildSets.length > 0) {
    guildVals.push(guildId);
    // First try to update
    const existing = getDb().prepare('SELECT 1 FROM guild_config WHERE guild_id = ?').get(guildId);
    if (existing) {
      getDb().prepare(`UPDATE guild_config SET ${guildSets.join(', ')} WHERE guild_id = ?`).run(...guildVals);
    } else {
      // Create new row with just the fields we need
      const cols = ['guild_id', ...guildSets.map(c => c.split(' = ')[0])];
      const ph = ['?', ...guildVals.map(() => '?')];
      getDb().prepare(`INSERT INTO guild_config (${cols.join(', ')}) VALUES (${ph.join(', ')})`).run(guildId, ...guildVals);
    }
  }
}

// ============ RAID ACTION TRACKER ============

export function trackRaidAction(guildId, userId, actionType) {
  const now = Math.floor(Date.now() / 1000);
  const existing = getDb().prepare(
    'SELECT * FROM raid_action_tracker WHERE guild_id = ? AND user_id = ? AND action_type = ?'
  ).get(guildId, userId, actionType);
  
  if (existing) {
    getDb().prepare(`
      UPDATE raid_action_tracker 
      SET count = count + 1, window_start = ?
      WHERE guild_id = ? AND user_id = ? AND action_type = ?
    `).run(now, guildId, userId, actionType);
  } else {
    getDb().prepare(`
      INSERT INTO raid_action_tracker (guild_id, user_id, action_type, count, window_start)
      VALUES (?, ?, ?, 1, ?)
    `).run(guildId, userId, actionType, now);
  }
}

export function getRaidActionCount(guildId, userId, actionType, windowSeconds) {
  const now = Math.floor(Date.now() / 1000);
  const windowStart = now - windowSeconds;
  
  const row = getDb().prepare(`
    SELECT count FROM raid_action_tracker 
    WHERE guild_id = ? AND user_id = ? AND action_type = ? AND window_start >= ?
  `).get(guildId, userId, actionType, windowStart);
  
  return row ? row.count : 0;
}

export function clearRaidActions(guildId, userId) {
  getDb().prepare('DELETE FROM raid_action_tracker WHERE guild_id = ? AND user_id = ?')
    .run(guildId, userId);
}

// Guild Config
export function getGuildConfig(guildId) {
  const row = getDb().prepare('SELECT * FROM guild_config WHERE guild_id = ?').get(guildId);
  if (!row) return {};
  return {
    prefix: row.prefix || '!',
    logChannel: row.log_channel,
    modLogChannel: row.mod_log_channel,
    serverLogChannel: row.server_log_channel,
    messageLogChannel: row.message_log_channel,
    raidLogChannel: row.raid_log_channel,
    voiceLogChannel: row.voice_log_channel,
    roleLogChannel: row.role_log_channel,
    logLevel: row.log_level || 'normal',
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
    raidLockDuration: row.raid_lock_duration || 15,
  };
}

export async function updateGuildConfig(guildId, updates) {
  const existing = getDb().prepare('SELECT 1 FROM guild_config WHERE guild_id = ?').get(guildId);
  const fieldMap = {
    prefix: 'prefix',
    logChannel: 'log_channel',
    modLogChannel: 'mod_log_channel',
    serverLogChannel: 'server_log_channel',
    messageLogChannel: 'message_log_channel',
    raidLogChannel: 'raid_log_channel',
    voiceLogChannel: 'voice_log_channel',
    roleLogChannel: 'role_log_channel',
    logLevel: 'log_level',
    mutedRole: 'muted_role',
    autoRole: 'auto_role',
    welcomeChannel: 'welcome_channel',
    welcomeMessage: 'welcome_message',
    goodbyeChannel: 'goodbye_channel',
    goodbyeMessage: 'goodbye_message',
    shieldEnabled: 'shield_enabled',
    antiSpamEnabled: 'anti_spam_enabled',
    antiRaidEnabled: 'anti_raid_enabled',
    autoModEnabled: 'auto_mod_enabled',
    derankThreshold: 'derank_threshold',
    raidThreshold: 'raid_threshold',
    raidLockDuration: 'raid_lock_duration',
    // New raid-related fields in guild_config
    antiraidEnabled: 'antiraid_enabled',
    antibotEnabled: 'antibot_enabled',
    antibotWhitelist: 'antibot_whitelist',
    raidWhitelist: 'raid_whitelist',
    raidChannelThreshold: 'raid_channel_threshold',
    raidChannelWindow: 'raid_channel_window',
    raidDeleteThreshold: 'raid_delete_threshold',
    raidDeleteWindow: 'raid_delete_window',
    raidBanThreshold: 'raid_ban_threshold',
    raidBanWindow: 'raid_ban_window',
    raidKickThreshold: 'raid_kick_threshold',
    raidKickWindow: 'raid_kick_window',
    raidSpamThreshold: 'raid_spam_threshold',
    raidSpamWindow: 'raid_spam_window',
    raidDerankDelay: 'raid_derank_delay',
    raidDmOnDerank: 'raid_dm_on_derank',
    raidLogChannel: 'raid_log_channel',
  };

  if (existing) {
    const sets = [];
    const vals = [];
    for (const [key, value] of Object.entries(updates)) {
      const col = fieldMap[key];
      if (col) {
        if (Array.isArray(value)) {
          sets.push(`${col} = ?`);
          vals.push(JSON.stringify(value));
        } else if (typeof value === 'boolean') {
          sets.push(`${col} = ?`);
          vals.push(value ? 1 : 0);
        } else {
          sets.push(`${col} = ?`);
          vals.push(value);
        }
      }
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
      if (col) {
        if (Array.isArray(value)) {
          cols.push(col);
          ph.push('?');
          vals.push(JSON.stringify(value));
        } else if (typeof value === 'boolean') {
          cols.push(col);
          ph.push('?');
          vals.push(value ? 1 : 0);
        } else {
          cols.push(col);
          ph.push('?');
          vals.push(value);
        }
      }
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

// Raid Action Log
export function addRaidActionLog(guildId, data) {
  const info = getDb().prepare(`
    INSERT INTO raid_action_log (guild_id, type, triggered_by, target_id, reason, threshold, join_speed, count, duration)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    guildId,
    data.type || 'unknown',
    data.triggeredBy || 'system',
    data.targetId || null,
    data.reason || null,
    data.threshold || null,
    data.joinSpeed || null,
    data.count || null,
    data.duration || null
  );
  return info.lastInsertRowid;
}

export function getRaidActionLog(guildId, limit = 50) {
  return getDb().prepare('SELECT * FROM raid_action_log WHERE guild_id = ? ORDER BY timestamp DESC LIMIT ?').all(guildId, limit);
}

export function clearRaidActionLog(guildId) {
  getDb().prepare('DELETE FROM raid_action_log WHERE guild_id = ?').run(guildId);
}

export function setDerankSanction(guildId, userId, sanction) {}
export function getDerankSanction(guildId, userId) { return null; }

export default {
  getGuildConfig, updateGuildConfig, getWhitelist, addToWhitelist, removeFromWhitelist,
  addWarning, getWarnings, clearWarnings, addLog, addViolation, getStats,
  addBackup, getBackup, addRaidEvent, addRaidActionLog, getRaidActionLog, clearRaidActionLog,
  setDerankSanction, getDerankSanction,
  // New raid functions
  addRaidConfig, getRaidConfig, updateRaidConfig,
  trackRaidAction, getRaidActionCount, clearRaidActions,
  addRaidActionLog, getRaidActionLog,
};
