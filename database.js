/**
 * Database Module - SQLite3 Based
 * Provides persistent storage for all bot data
 */

const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'data', 'bot.db');

// Ensure data directory exists
const dataDir = path.dirname(DB_PATH);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Initialize database
const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');

// Create tables
function initializeTables() {
  // Users table - economy, XP, level data
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      user_id TEXT PRIMARY KEY,
      guild_id TEXT NOT NULL,
      xp INTEGER DEFAULT 0,
      level INTEGER DEFAULT 1,
      coins INTEGER DEFAULT 0,
      daily_timestamp INTEGER DEFAULT 0,
      streak INTEGER DEFAULT 0,
      warnings INTEGER DEFAULT 0,
      birthday TEXT,
      created_at INTEGER DEFAULT (strftime('%s', 'now'))
    )
  `);
  
  // Economy table - items, inventory
  db.exec(`
    CREATE TABLE IF NOT EXISTS economy (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      guild_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      item_type TEXT NOT NULL,
      item_id TEXT NOT NULL,
      quantity INTEGER DEFAULT 1,
      UNIQUE(guild_id, user_id, item_type, item_id)
    )
  `);
  
  // Warnings table
  db.exec(`
    CREATE TABLE IF NOT EXISTS warnings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      guild_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      moderator_id TEXT NOT NULL,
      reason TEXT NOT NULL,
      created_at INTEGER DEFAULT (strftime('%s', 'now'))
    )
  `);
  
  // Tickets table
  db.exec(`
    CREATE TABLE IF NOT EXISTS tickets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ticket_id TEXT UNIQUE NOT NULL,
      guild_id TEXT NOT NULL,
      channel_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      category TEXT,
      status TEXT DEFAULT 'open',
      created_at INTEGER DEFAULT (strftime('%s', 'now'))
    )
  `);
  
  // Suggestions table
  db.exec(`
    CREATE TABLE IF NOT EXISTS suggestions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      guild_id TEXT NOT NULL,
      message_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      content TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      votes_up TEXT DEFAULT '',
      votes_down TEXT DEFAULT '',
      created_at INTEGER DEFAULT (strftime('%s', 'now'))
    )
  `);
  
  // Giveaways table
  db.exec(`
    CREATE TABLE IF NOT EXISTS giveaways (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      guild_id TEXT NOT NULL,
      message_id TEXT NOT NULL,
      prize TEXT NOT NULL,
      winners INTEGER DEFAULT 1,
      ends_at INTEGER NOT NULL,
      participants TEXT DEFAULT '[]',
      created_at INTEGER DEFAULT (strftime('%s', 'now'))
    )
  `);
  
  // Starboard table
  db.exec(`
    CREATE TABLE IF NOT EXISTS starboard (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      guild_id TEXT NOT NULL,
      message_id TEXT NOT NULL,
      star_message_id TEXT NOT NULL,
      star_count INTEGER DEFAULT 0,
      created_at INTEGER DEFAULT (strftime('%s', 'now'))
    )
  `);
  
  // Reminders table
  db.exec(`
    CREATE TABLE IF NOT EXISTS reminders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      guild_id TEXT NOT NULL,
      message TEXT NOT NULL,
      remind_at INTEGER NOT NULL,
      created_at INTEGER DEFAULT (strftime('%s', 'now'))
    )
  `);
  
  // Reports table
  db.exec(`
    CREATE TABLE IF NOT EXISTS reports (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      guild_id TEXT NOT NULL,
      reporter_id TEXT NOT NULL,
      reported_id TEXT NOT NULL,
      reason TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      created_at INTEGER DEFAULT (strftime('%s', 'now'))
    )
  `);
  
  // Level roles table - auto roles at certain levels
  db.exec(`
    CREATE TABLE IF NOT EXISTS level_roles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      guild_id TEXT NOT NULL,
      role_id TEXT NOT NULL,
      level INTEGER NOT NULL,
      UNIQUE(guild_id, level)
    )
  `);
  
  // Custom commands table
  db.exec(`
    CREATE TABLE IF NOT EXISTS custom_commands (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      guild_id TEXT NOT NULL,
      name TEXT NOT NULL,
      response TEXT NOT NULL,
      created_by TEXT NOT NULL,
      created_at INTEGER DEFAULT (strftime('%s', 'now')),
      UNIQUE(guild_id, name)
    )
  `);
  
  // Welcome/leave settings table
  db.exec(`
    CREATE TABLE IF NOT EXISTS welcome_settings (
      guild_id TEXT PRIMARY KEY,
      channel_id TEXT,
      welcome_message TEXT,
      leave_message TEXT,
      embed_color INTEGER DEFAULT 0x00ff00,
      embed_image TEXT,
      leave_embed_color INTEGER DEFAULT 0xff0000,
      enabled INTEGER DEFAULT 1
    )
  `);
  
  // Verification settings table
  db.exec(`
    CREATE TABLE IF NOT EXISTS verification_settings (
      guild_id TEXT PRIMARY KEY,
      channel_id TEXT,
      role_id TEXT,
      verified_role_id TEXT,
      captcha_code TEXT,
      enabled INTEGER DEFAULT 0
    )
  `);
  
  // Anti-nuke settings table
  db.exec(`
    CREATE TABLE IF NOT EXISTS antinuke_settings (
      guild_id TEXT PRIMARY KEY,
      enabled INTEGER DEFAULT 1,
      whitelist_roles TEXT DEFAULT '[]',
      whitelist_users TEXT DEFAULT '[]',
      webhook_limit INTEGER DEFAULT 5,
      channel_limit INTEGER DEFAULT 5,
      role_limit INTEGER DEFAULT 5,
      ban_threshold INTEGER DEFAULT 5,
      kick_threshold INTEGER DEFAULT 10,
      bot_whitelist TEXT DEFAULT '[]'
    )
  `);
  
  // Server stats (daily snapshots)
  db.exec(`
    CREATE TABLE IF NOT EXISTS server_stats (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      guild_id TEXT NOT NULL,
      member_count INTEGER DEFAULT 0,
      channel_count INTEGER DEFAULT 0,
      created_at INTEGER DEFAULT (strftime('%s', 'now'))
    )
  `);
  
  // Audit logs table
  db.exec(`
    CREATE TABLE IF NOT EXISTS audit_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      guild_id TEXT NOT NULL,
      action TEXT NOT NULL,
      user_id TEXT NOT NULL,
      target_id TEXT,
      details TEXT,
      created_at INTEGER DEFAULT (strftime('%s', 'now'))
    )
  `);
  
  // YouTube/Twitch notifications
  db.exec(`
    CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      guild_id TEXT NOT NULL,
      channel_id TEXT NOT NULL,
      service TEXT NOT NULL,
      channel_url TEXT NOT NULL,
      last_video_id TEXT,
      enabled INTEGER DEFAULT 1,
      created_at INTEGER DEFAULT (strftime('%s', 'now'))
    )
  `);
  
  console.log('[Database] Tables initialized');
}

// User functions
function getUser(userId, guildId) {
  const stmt = db.prepare('SELECT * FROM users WHERE user_id = ? AND guild_id = ?');
  return stmt.get(userId, guildId);
}

function createUser(userId, guildId) {
  const stmt = db.prepare(`
    INSERT INTO users (user_id, guild_id) VALUES (?, ?)
  `);
  stmt.run(userId, guildId);
  return getUser(userId, guildId);
}

function getOrCreateUser(userId, guildId) {
  let user = getUser(userId, guildId);
  if (!user) {
    user = createUser(userId, guildId);
  }
  return user;
}

function updateXP(userId, guildId, xp) {
  const stmt = db.prepare(`
    UPDATE users SET xp = xp + ? WHERE user_id = ? AND guild_id = ?
  `);
  stmt.run(xp, userId, guildId);
}

function updateCoins(userId, guildId, coins) {
  const stmt = db.prepare(`
    UPDATE users SET coins = coins + ? WHERE user_id = ? AND guild_id = ?
  `);
  stmt.run(coins, userId, guildId);
}

function setLevel(userId, guildId, level) {
  const stmt = db.prepare(`
    UPDATE users SET level = ? WHERE user_id = ? AND guild_id = ?
  `);
  stmt.run(level, userId, guildId);
}

function setBirthday(userId, guildId, birthday) {
  const stmt = db.prepare(`
    UPDATE users SET birthday = ? WHERE user_id = ? AND guild_id = ?
  `);
  stmt.run(birthday, userId, guildId);
}

// Economy functions
function getInventory(userId, guildId) {
  const stmt = db.prepare('SELECT * FROM economy WHERE user_id = ? AND guild_id = ?');
  return stmt.all(userId, guildId);
}

function addItem(userId, guildId, itemType, itemId, quantity = 1) {
  const stmt = db.prepare(`
    INSERT INTO economy (guild_id, user_id, item_type, item_id, quantity)
    VALUES (?, ?, ?, ?, ?)
    ON CONFLICT(guild_id, user_id, item_type, item_id)
    DO UPDATE SET quantity = quantity + ?
  `);
  stmt.run(guildId, userId, itemType, itemId, quantity, quantity);
}

function removeItem(userId, guildId, itemType, itemId, quantity = 1) {
  const stmt = db.prepare(`
    UPDATE economy SET quantity = quantity - ? 
    WHERE user_id = ? AND guild_id = ? AND item_type = ? AND item_id = ?
  `);
  stmt.run(quantity, userId, guildId, itemType, itemId);
}

// Warnings
function getWarnings(userId, guildId) {
  const stmt = db.prepare('SELECT * FROM warnings WHERE user_id = ? AND guild_id = ? ORDER BY created_at DESC');
  return stmt.all(userId, guildId);
}

function addWarning(guildId, userId, moderatorId, reason) {
  const stmt = db.prepare(`
    INSERT INTO warnings (guild_id, user_id, moderator_id, reason)
    VALUES (?, ?, ?, ?)
  `);
  stmt.run(guildId, userId, moderatorId, reason);
}

function clearWarnings(userId, guildId) {
  const stmt = db.prepare('DELETE FROM warnings WHERE user_id = ? AND guild_id = ?');
  stmt.run(userId, guildId);
}

// Tickets
function createTicket(guildId, channelId, userId, category) {
  const ticketId = `TKT-${Date.now()}`;
  const stmt = db.prepare(`
    INSERT INTO tickets (ticket_id, guild_id, channel_id, user_id, category)
    VALUES (?, ?, ?, ?, ?)
  `);
  stmt.run(ticketId, guildId, channelId, userId, category || 'general');
  return ticketId;
}

function closeTicket(ticketId) {
  const stmt = db.prepare('UPDATE tickets SET status = ? WHERE ticket_id = ?');
  stmt.run('closed', ticketId);
}

function getTicket(ticketId) {
  const stmt = db.prepare('SELECT * FROM tickets WHERE ticket_id = ?');
  return stmt.get(ticketId);
}

function getOpenTickets(guildId, userId) {
  const stmt = db.prepare('SELECT * FROM tickets WHERE guild_id = ? AND user_id = ? AND status = ?');
  return stmt.all(guildId, userId, 'open');
}

// Suggestions
function createSuggestion(guildId, messageId, userId, content) {
  const stmt = db.prepare(`
    INSERT INTO suggestions (guild_id, message_id, user_id, content)
    VALUES (?, ?, ?, ?)
  `);
  const result = stmt.run(guildId, messageId, userId, content);
  return result.lastInsertRowid;
}

function voteSuggestion(id, userId, vote) {
  const suggestion = db.prepare('SELECT * FROM suggestions WHERE id = ?').get(id);
  if (!suggestion) return null;
  
  let votesUp = suggestion.votes_up ? suggestion.votes_up.split(',').filter(Boolean) : [];
  let votesDown = suggestion.votes_down ? suggestion.votes_down.split(',').filter(Boolean) : [];
  
  // Remove existing vote
  votesUp = votesUp.filter(v => v !== userId);
  votesDown = votesDown.filter(v => v !== userId);
  
  if (vote === 'up') votesUp.push(userId);
  else if (vote === 'down') votesDown.push(userId);
  
  const stmt = db.prepare(`
    UPDATE suggestions SET votes_up = ?, votes_down = ? WHERE id = ?
  `);
  stmt.run(votesUp.join(','), votesDown.join(','), id);
  
  return { votesUp: votesUp.length, votesDown: votesDown.length };
}

function getSuggestion(id) {
  return db.prepare('SELECT * FROM suggestions WHERE id = ?').get(id);
}

function getSuggestions(guildId) {
  return db.prepare('SELECT * FROM suggestions WHERE guild_id = ? ORDER BY created_at DESC').all(guildId);
}

// Giveaways
function createGiveaway(guildId, messageId, prize, winners, endsAt) {
  const stmt = db.prepare(`
    INSERT INTO giveaways (guild_id, message_id, prize, winners, ends_at)
    VALUES (?, ?, ?, ?, ?)
  `);
  stmt.run(guildId, messageId, prize, winners, endsAt);
}

function joinGiveaway(messageId, userId) {
  const giveaway = db.prepare('SELECT * FROM giveaways WHERE message_id = ?').get(messageId);
  if (!giveaway) return false;
  
  let participants = JSON.parse(giveaway.participants || '[]');
  if (participants.includes(userId)) return false;
  
  participants.push(userId);
  const stmt = db.prepare('UPDATE giveaways SET participants = ? WHERE message_id = ?');
  stmt.run(JSON.stringify(participants), messageId);
  return true;
}

function endGiveaway(messageId) {
  const giveaway = db.prepare('SELECT * FROM giveaways WHERE message_id = ?').get(messageId);
  if (!giveaway) return null;
  
  let participants = JSON.parse(giveaway.participants || '[]');
  // Shuffle and pick winners
  participants = participants.sort(() => Math.random() - 0.5);
  const winners = participants.slice(0, giveaway.winners);
  
  const stmt = db.prepare('UPDATE giveaways SET participants = ? WHERE message_id = ?');
  stmt.run(JSON.stringify(winners), messageId);
  
  return winners;
}

// Starboard
function addToStarboard(guildId, messageId, starMessageId) {
  const stmt = db.prepare(`
    INSERT INTO starboard (guild_id, message_id, star_message_id)
    VALUES (?, ?, ?)
  `);
  stmt.run(guildId, messageId, starMessageId);
}

function getStarboardMessage(messageId) {
  return db.prepare('SELECT * FROM starboard WHERE message_id = ?').get(messageId);
}

function updateStarCount(messageId, count) {
  const stmt = db.prepare('UPDATE starboard SET star_count = ? WHERE message_id = ?');
  stmt.run(count, messageId);
}

// Reminders
function createReminder(userId, guildId, message, remindAt) {
  const stmt = db.prepare(`
    INSERT INTO reminders (user_id, guild_id, message, remind_at)
    VALUES (?, ?, ?, ?)
  `);
  const result = stmt.run(userId, guildId, message, remindAt);
  return result.lastInsertRowid;
}

function getReminders(userId) {
  return db.prepare('SELECT * FROM reminders WHERE user_id = ? AND remind_at > ? ORDER BY remind_at').all(userId, Date.now() / 1000);
}

function deleteReminder(id) {
  const stmt = db.prepare('DELETE FROM reminders WHERE id = ?');
  stmt.run(id);
}

// Reports
function createReport(guildId, reporterId, reportedId, reason) {
  const stmt = db.prepare(`
    INSERT INTO reports (guild_id, reporter_id, reported_id, reason)
    VALUES (?, ?, ?, ?)
  `);
  stmt.run(guildId, reporterId, reportedId, reason);
}

function getReports(guildId) {
  return db.prepare('SELECT * FROM reports WHERE guild_id = ? ORDER BY created_at DESC').all(guildId);
}

// Level roles
function addLevelRole(guildId, roleId, level) {
  const stmt = db.prepare(`
    INSERT INTO level_roles (guild_id, role_id, level)
    VALUES (?, ?, ?)
    ON CONFLICT(guild_id, level)
    DO UPDATE SET role_id = ?
  `);
  stmt.run(guildId, roleId, level, roleId);
}

function getLevelRoles(guildId) {
  return db.prepare('SELECT * FROM level_roles WHERE guild_id = ? ORDER BY level').all(guildId);
}

function getLevelRole(level) {
  return db.prepare('SELECT * FROM level_roles WHERE guild_id = ? AND level <= ? ORDER BY level DESC LIMIT 1');
}

// Custom commands
function addCustomCommand(guildId, name, response, createdBy) {
  const stmt = db.prepare(`
    INSERT INTO custom_commands (guild_id, name, response, created_by)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(guild_id, name)
    DO UPDATE SET response = ?
  `);
  stmt.run(guildId, name, response, createdBy, response);
}

function deleteCustomCommand(guildId, name) {
  const stmt = db.prepare('DELETE FROM custom_commands WHERE guild_id = ? AND name = ?');
  stmt.run(guildId, name);
}

function getCustomCommand(guildId, name) {
  return db.prepare('SELECT * FROM custom_commands WHERE guild_id = ? AND name = ?').get(guildId, name);
}

function getCustomCommands(guildId) {
  return db.prepare('SELECT * FROM custom_commands WHERE guild_id = ?').all(guildId);
}

// Welcome/Leave settings
function getWelcomeSettings(guildId) {
  return db.prepare('SELECT * FROM welcome_settings WHERE guild_id = ?').get(guildId);
}

function setWelcomeSettings(guildId, settings) {
  const stmt = db.prepare(`
    INSERT INTO welcome_settings (guild_id, channel_id, welcome_message, leave_message, embed_color, embed_image, leave_embed_color, enabled)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(guild_id)
    DO UPDATE SET channel_id = ?, welcome_message = ?, leave_message = ?, embed_color = ?, embed_image = ?, leave_embed_color = ?, enabled = ?
  `);
  stmt.run(
    guildId, settings.channelId, settings.welcomeMessage, settings.leaveMessage,
    settings.embedColor, settings.embedImage, settings.leaveEmbedColor, settings.enabled,
    settings.channelId, settings.welcomeMessage, settings.leaveMessage,
    settings.embedColor, settings.embedImage, settings.leaveEmbedColor, settings.enabled
  );
}

// Verification settings
function getVerificationSettings(guildId) {
  return db.prepare('SELECT * FROM verification_settings WHERE guild_id = ?').get(guildId);
}

function setVerificationSettings(guildId, settings) {
  const stmt = db.prepare(`
    INSERT INTO verification_settings (guild_id, channel_id, role_id, verified_role_id, captcha_code, enabled)
    VALUES (?, ?, ?, ?, ?, ?)
    ON CONFLICT(guild_id)
    DO UPDATE SET channel_id = ?, role_id = ?, verified_role_id = ?, captcha_code = ?, enabled = ?
  `);
  stmt.run(
    guildId, settings.channelId, settings.roleId, settings.verifiedRoleId, settings.captchaCode, settings.enabled,
    settings.channelId, settings.roleId, settings.verifiedRoleId, settings.captchaCode, settings.enabled
  );
}

// Anti-nuke settings
function getAntiNukeSettings(guildId) {
  return db.prepare('SELECT * FROM antinuke_settings WHERE guild_id = ?').get(guildId);
}

function setAntiNukeSettings(guildId, settings) {
  const stmt = db.prepare(`
    INSERT INTO antinuke_settings (guild_id, enabled, whitelist_roles, whitelist_users, webhook_limit, channel_limit, role_limit, ban_threshold, kick_threshold, bot_whitelist)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(guild_id)
    DO UPDATE SET enabled = ?, whitelist_roles = ?, whitelist_users = ?, webhook_limit = ?, channel_limit = ?, role_limit = ?, ban_threshold = ?, kick_threshold = ?, bot_whitelist = ?
  `);
  stmt.run(
    guildId, settings.enabled, JSON.stringify(settings.whitelistRoles), JSON.stringify(settings.whitelistUsers),
    settings.webhookLimit, settings.channelLimit, settings.roleLimit, settings.banThreshold, settings.kickThreshold, JSON.stringify(settings.botWhitelist),
    settings.enabled, JSON.stringify(settings.whitelistRoles), JSON.stringify(settings.whitelistUsers),
    settings.webhookLimit, settings.channelLimit, settings.roleLimit, settings.banThreshold, settings.kickThreshold, JSON.stringify(settings.botWhitelist)
  );
}

// Server stats
function saveServerStats(guildId, memberCount, channelCount) {
  const stmt = db.prepare(`
    INSERT INTO server_stats (guild_id, member_count, channel_count)
    VALUES (?, ?, ?)
  `);
  stmt.run(guildId, memberCount, channelCount);
}

function getServerStats(guildId, days = 30) {
  return db.prepare(`
    SELECT * FROM server_stats 
    WHERE guild_id = ? AND created_at > ?
    ORDER BY created_at DESC
  `).all(guildId, Math.floor(Date.now() / 1000) - (days * 24 * 60 * 60));
}

// Audit logs
function logAuditAction(guildId, action, userId, targetId, details) {
  const stmt = db.prepare(`
    INSERT INTO audit_logs (guild_id, action, user_id, target_id, details)
    VALUES (?, ?, ?, ?, ?)
  `);
  stmt.run(guildId, action, userId, targetId, details);
}

function getAuditLogs(guildId, limit = 100) {
  return db.prepare(`
    SELECT * FROM audit_logs WHERE guild_id = ? ORDER BY created_at DESC LIMIT ?
  `).all(guildId, limit);
}

// Notifications (YouTube/Twitch)
function addNotification(guildId, channelId, service, channelUrl) {
  const stmt = db.prepare(`
    INSERT INTO notifications (guild_id, channel_id, service, channel_url)
    VALUES (?, ?, ?, ?)
  `);
  stmt.run(guildId, channelId, service, channelUrl);
}

function getNotifications(guildId, service) {
  return db.prepare('SELECT * FROM notifications WHERE guild_id = ? AND service = ? AND enabled = 1').all(guildId, service);
}

function updateLastVideoId(id, videoId) {
  const stmt = db.prepare('UPDATE notifications SET last_video_id = ? WHERE id = ?');
  stmt.run(videoId, id);
}

// Initialize on module load
initializeTables();

module.exports = {
  db,
  // User functions
  getUser,
  createUser,
  getOrCreateUser,
  updateXP,
  updateCoins,
  setLevel,
  setBirthday,
  // Economy
  getInventory,
  addItem,
  removeItem,
  // Warnings
  getWarnings,
  addWarning,
  clearWarnings,
  // Tickets
  createTicket,
  closeTicket,
  getTicket,
  getOpenTickets,
  // Suggestions
  createSuggestion,
  voteSuggestion,
  getSuggestion,
  getSuggestions,
  // Giveaways
  createGiveaway,
  joinGiveaway,
  endGiveaway,
  // Starboard
  addToStarboard,
  getStarboardMessage,
  updateStarCount,
  // Reminders
  createReminder,
  getReminders,
  deleteReminder,
  // Reports
  createReport,
  getReports,
  // Level roles
  addLevelRole,
  getLevelRoles,
  getLevelRole,
  // Custom commands
  addCustomCommand,
  deleteCustomCommand,
  getCustomCommand,
  getCustomCommands,
  // Welcome/Leave
  getWelcomeSettings,
  setWelcomeSettings,
  // Verification
  getVerificationSettings,
  setVerificationSettings,
  // Anti-nuke
  getAntiNukeSettings,
  setAntiNukeSettings,
  // Stats
  saveServerStats,
  getServerStats,
  // Audit
  logAuditAction,
  getAuditLogs,
  // Notifications
  addNotification,
  getNotifications,
  updateLastVideoId
};