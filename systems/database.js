/**
 * Database System - SQLite-based data persistence
 * Handles economy, verification, giveaways, suggestions, and per-guild settings
 */

const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

// Database manager class
class DatabaseManager {
  constructor(dataPath) {
    this.dataPath = dataPath || path.join(__dirname, '..', 'data');
    this.databases = new Map();
    
    // Create data directory if not exists
    if (!fs.existsSync(this.dataPath)) {
      fs.mkdirSync(this.dataPath, { recursive: true });
    }
  }
  
  // Get or create database for a guild
  getDB(guildId) {
    if (this.databases.has(guildId)) {
      return this.databases.get(guildId);
    }
    
    const dbPath = path.join(this.dataPath, `${guildId}.sqlite`);
    const db = new Database(dbPath);
    
    // Enable WAL mode for better performance
    db.pragma('journal_mode = WAL');
    
    this.databases.set(guildId, db);
    this.initializeTables(db, guildId);
    
    return db;
  }
  
  // Initialize tables for a guild database
  initializeTables(db, guildId) {
    // Economy table
    db.exec(`
      CREATE TABLE IF NOT EXISTS economy (
        user_id TEXT PRIMARY KEY,
        balance REAL DEFAULT 0,
        bank REAL DEFAULT 0,
        xp INTEGER DEFAULT 0,
        level INTEGER DEFAULT 1,
        daily_streak INTEGER DEFAULT 0,
        last_daily INTEGER,
        last_weekly INTEGER,
        created_at INTEGER DEFAULT (strftime('%s', 'now'))
      )
    `);
    
    // Warnings table
    db.exec(`
      CREATE TABLE IF NOT EXISTS warnings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        moderator_id TEXT NOT NULL,
        reason TEXT,
        created_at INTEGER DEFAULT (strftime('%s', 'now'))
      )
    `);
    
    // Tickets table
    db.exec(`
      CREATE TABLE IF NOT EXISTS tickets (
        channel_id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        category TEXT,
        status TEXT DEFAULT 'open',
        created_at INTEGER DEFAULT (strftime('%s', 'now'))
      )
    `);
    
    // Giveaways table
    db.exec(`
      CREATE TABLE IF NOT EXISTS giveaways (
        message_id TEXT PRIMARY KEY,
        prize TEXT NOT NULL,
        count INTEGER DEFAULT 1,
        ends_at INTEGER NOT NULL,
        winners TEXT,
        required_role TEXT,
        required_level INTEGER DEFAULT 1,
        created_at INTEGER DEFAULT (strftime('%s', 'now'))
      )
    `);
    
    // Suggestions table
    db.exec(`
      CREATE TABLE IF NOT EXISTS suggestions (
        message_id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        content TEXT NOT NULL,
        status TEXT DEFAULT 'pending',
        response TEXT,
        response_by TEXT,
        created_at INTEGER DEFAULT (strftime('%s', 'now'))
      )
    `);
    
    // Starred messages table
    db.exec(`
      CREATE TABLE IF NOT EXISTS starred (
        message_id TEXT PRIMARY KEY,
        channel_id TEXT NOT NULL,
        star_count INTEGER DEFAULT 1,
        star_users TEXT,
        created_at INTEGER DEFAULT (strftime('%s', 'now'))
      )
    `);
    
    // Verification table
    db.exec(`
      CREATE TABLE IF NOT EXISTS verification (
        user_id TEXT PRIMARY KEY,
        code TEXT,
        verified_at INTEGER,
        attempts INTEGER DEFAULT 0
      )
    `);
    
    // Guild settings table
    db.exec(`
      CREATE TABLE IF NOT EXISTS guild_settings (
        key TEXT PRIMARY KEY,
        value TEXT
      )
    `);
    
    // Cooldowns table
    db.exec(`
      CREATE TABLE IF NOT EXISTS cooldowns (
        user_id TEXT NOT NULL,
        command TEXT NOT NULL,
        expires_at INTEGER,
        PRIMARY KEY (user_id, command)
      )
    `);
    
    // Nickname history table
    db.exec(`
      CREATE TABLE IF NOT EXISTS nickname_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        old_nickname TEXT,
        new_nickname TEXT,
        changed_at INTEGER DEFAULT (strftime('%s', 'now'))
      )
    `);
    
    console.log(`[Database] Initialized tables for guild ${guildId}`);
  }
  
  // Economy methods
  getUser(userId, guildId) {
    const db = this.getDB(guildId);
    return db.prepare('SELECT * FROM economy WHERE user_id = ?').get(userId);
  }
  
  createUser(userId, guildId, initialBalance = 0) {
    const db = this.getDB(guildId);
    db.prepare(`
      INSERT INTO economy (user_id, balance) VALUES (?, ?)
    `).run(userId, initialBalance);
    return this.getUser(userId, guildId);
  }
  
  getOrCreateUser(userId, guildId) {
    let user = this.getUser(userId, guildId);
    if (!user) {
      user = this.createUser(userId, guildId);
    }
    return user;
  }
  
  updateBalance(userId, guildId, amount) {
    const db = this.getDB(guildId);
    db.prepare(`
      INSERT INTO economy (user_id, balance) VALUES (?, ?)
      ON CONFLICT(user_id) DO UPDATE SET balance = balance + ?
    `).run(userId, amount, amount);
  }
  
  setBalance(userId, guildId, amount) {
    const db = this.getDB(guildId);
    db.prepare(`
      INSERT INTO economy (user_id, balance) VALUES (?, ?)
      ON CONFLICT(user_id) DO UPDATE SET balance = ?
    `).run(userId, amount, amount);
  }
  
  updateXP(userId, guildId, xp) {
    const db = this.getDB(guildId);
    db.prepare(`
      INSERT INTO economy (user_id, xp) VALUES (?, ?)
      ON CONFLICT(user_id) DO UPDATE SET xp = xp + ?
    `).run(userId, xp, xp);
  }
  
  // Warning methods
  addWarning(userId, guildId, moderatorId, reason) {
    const db = this.getDB(guildId);
    const result = db.prepare(`
      INSERT INTO warnings (user_id, moderator_id, reason) VALUES (?, ?, ?)
    `).run(userId, moderatorId, reason);
    return result.lastInsertRowid;
  }
  
  getWarnings(userId, guildId) {
    const db = this.getDB(guildId);
    return db.prepare('SELECT * FROM warnings WHERE user_id = ? ORDER BY created_at DESC').all(userId);
  }
  
  clearWarnings(userId, guildId) {
    const db = this.getDB(guildId);
    return db.prepare('DELETE FROM warnings WHERE user_id = ?').run(userId);
  }
  
  // Ticket methods
  createTicket(channelId, userId, guildId, category) {
    const db = this.getDB(guildId);
    db.prepare(`
      INSERT INTO tickets (channel_id, user_id, category) VALUES (?, ?, ?)
    `).run(channelId, userId, category);
  }
  
  getTicket(channelId, guildId) {
    const db = this.getDB(guildId);
    return db.prepare('SELECT * FROM tickets WHERE channel_id = ?').get(channelId);
  }
  
  closeTicket(channelId, guildId) {
    const db = this.getDB(guildId);
    return db.prepare('UPDATE tickets SET status = ? WHERE channel_id = ?').run('closed', channelId);
  }
  
  getOpenTickets(guildId) {
    const db = this.getDB(guildId);
    return db.prepare('SELECT * FROM tickets WHERE status = ?').all('open');
  }
  
  // Giveaway methods
  createGiveaway(messageId, guildId, prize, endsAt, options = {}) {
    const db = this.getDB(guildId);
    db.prepare(`
      INSERT INTO giveaways (message_id, prize, count, ends_at, required_role, required_level)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(messageId, prize, options.count || 1, endsAt, options.requiredRole, options.requiredLevel || 1);
  }
  
  getGiveaway(messageId, guildId) {
    const db = this.getDB(guildId);
    return db.prepare('SELECT * FROM giveaways WHERE message_id = ?').get(messageId);
  }
  
  endGiveaway(messageId, guildId, winners) {
    const db = this.getDB(guildId);
    return db.prepare(`
      UPDATE giveaways SET winners = ? WHERE message_id = ?
    `).run(JSON.stringify(winners), messageId);
  }
  
  getActiveGiveaways(guildId) {
    const db = this.getDB(guildId);
    const now = Math.floor(Date.now() / 1000);
    return db.prepare('SELECT * FROM giveaways WHERE ends_at > ?').all(now);
  }
  
  // Suggestion methods
  createSuggestion(messageId, userId, guildId, content) {
    const db = this.getDB(guildId);
    db.prepare(`
      INSERT INTO suggestions (message_id, user_id, content) VALUES (?, ?, ?)
    `).run(messageId, userId, content);
  }
  
  getSuggestion(messageId, guildId) {
    const db = this.getDB(guildId);
    return db.prepare('SELECT * FROM suggestions WHERE message_id = ?').get(messageId);
  }
  
  updateSuggestionStatus(messageId, guildId, status, response, responseBy) {
    const db = this.getDB(guildId);
    return db.prepare(`
      UPDATE suggestions SET status = ?, response = ?, response_by = ? WHERE message_id = ?
    `).run(status, response, responseBy, messageId);
  }
  
  // Starboard methods
  starMessage(messageId, channelId, guildId, userId) {
    const db = this.getDB(guildId);
    const existing = db.prepare('SELECT * FROM starred WHERE message_id = ?').get(messageId);
    
    if (existing) {
      const starUsers = JSON.parse(existing.star_users || '[]');
      if (!starUsers.includes(userId)) {
        starUsers.push(userId);
        db.prepare(`
          UPDATE starred SET star_count = star_count + 1, star_users = ? WHERE message_id = ?
        `).run(JSON.stringify(starUsers), messageId);
        return { ...existing, star_count: existing.star_count + 1, star_users: JSON.stringify(starUsers) };
      }
    } else {
      db.prepare(`
        INSERT INTO starred (message_id, channel_id, star_users) VALUES (?, ?, ?)
      `).run(messageId, channelId, JSON.stringify([userId]));
    }
    return existing;
  }
  
  getStarred(messageId, guildId) {
    const db = this.getDB(guildId);
    return db.prepare('SELECT * FROM starred WHERE message_id = ?').get(messageId);
  }
  
  // Verification methods
  createVerification(userId, guildId, code) {
    const db = this.getDB(guildId);
    db.prepare(`
      INSERT INTO verification (user_id, code) VALUES (?, ?)
      ON CONFLICT(user_id) DO UPDATE SET code = ?, attempts = 0
    `).run(userId, code, code);
  }
  
  verifyCode(userId, guildId, code) {
    const db = this.getDB(guildId);
    const record = db.prepare('SELECT * FROM verification WHERE user_id = ?').get(userId);
    
    if (record && record.code === code) {
      db.prepare(`
        UPDATE verification SET verified_at = ?, attempts = 0 WHERE user_id = ?
      `).run(Math.floor(Date.now() / 1000), userId);
      return true;
    }
    
    if (record) {
      db.prepare('UPDATE verification SET attempts = attempts + 1 WHERE user_id = ?').run(userId);
    }
    
    return false;
  }
  
  isVerified(userId, guildId) {
    const db = this.getDB(guildId);
    const record = db.prepare('SELECT * FROM verification WHERE user_id = ?').get(userId);
    return record && record.verified_at;
  }
  
  // Guild settings methods
  getSetting(key, guildId) {
    const db = this.getDB(guildId);
    const row = db.prepare('SELECT value FROM guild_settings WHERE key = ?').get(key);
    return row ? JSON.parse(row.value) : null;
  }
  
  setSetting(key, guildId, value) {
    const db = this.getDB(guildId);
    db.prepare(`
      INSERT INTO guild_settings (key, value) VALUES (?, ?)
      ON CONFLICT(key) DO UPDATE SET value = ?
    `).run(key, JSON.stringify(value), JSON.stringify(value));
  }
  
  // Cooldown methods
  setCooldown(userId, guildId, command, durationMs) {
    const db = this.getDB(guildId);
    const expiresAt = Math.floor(Date.now() / 1000) + Math.floor(durationMs / 1000);
    db.prepare(`
      INSERT INTO cooldowns (user_id, command, expires_at) VALUES (?, ?, ?)
      ON CONFLICT(user_id, command) DO UPDATE SET expires_at = ?
    `).run(userId, command, expiresAt, expiresAt);
  }
  
  getCooldown(userId, guildId, command) {
    const db = this.getDB(guildId);
    const row = db.prepare('SELECT expires_at FROM cooldowns WHERE user_id = ? AND command = ?').get(userId, command);
    if (row) {
      const now = Math.floor(Date.now() / 1000);
      if (row.expires_at > now) {
        return (row.expires_at - now) * 1000;
      }
    }
    return 0;
  }
  
  // Get leaderboard
  getLeaderboard(guildId, sortBy = 'balance', limit = 10) {
    const db = this.getDB(guildId);
    return db.prepare(`
      SELECT * FROM economy ORDER BY ${sortBy === 'xp' ? 'xp' : 'balance'} DESC LIMIT ?
    `).all(limit);
  }
  
  // Export data for backup
  exportData(guildId) {
    const db = this.getDB(guildId);
    const data = {};
    
    // Export all tables
    const tables = ['economy', 'warnings', 'tickets', 'giveaways', 'suggestions', 'starred', 'verification', 'guild_settings'];
    
    for (const table of tables) {
      try {
        data[table] = db.prepare(`SELECT * FROM ${table}`).all();
      } catch (e) {
        data[table] = [];
      }
    }
    
    return data;
  }
  
  // Close database connection
  close(guildId) {
    if (this.databases.has(guildId)) {
      const db = this.databases.get(guildId);
      db.close();
      this.databases.delete(guildId);
    }
  }
  
  // Close all databases
  closeAll() {
    for (const [guildId, db] of this.databases) {
      db.close();
    }
    this.databases.clear();
  }
}

// Export singleton instance
module.exports = (client) => {
  // Initialize database manager
  const dbManager = new DatabaseManager();
  
  // Attach to client
  client.db = dbManager;
  client.dbManager = dbManager;
  
  console.log('[Database] Database system initialized');
  
  return dbManager;
};