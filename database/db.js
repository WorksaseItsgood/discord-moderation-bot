/**
 * Database Module - JSON-based persistence with MongoDB fallback
 * Supports: Guild configs, warnings, mutes, logs, violations
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DB_DIR = join(__dirname);
const DATA_DIR = join(DB_DIR, '..', 'data');

// Ensure data directory exists
if (!existsSync(DATA_DIR)) {
  mkdirSync(DATA_DIR, { recursive: true });
}

// ====================== FILE PATHS ======================

const FILES = {
  guildConfigs: join(DATA_DIR, 'guildConfigs.json'),
  warnings: join(DATA_DIR, 'warnings.json'),
  mutes: join(DATA_DIR, 'mutes.json'),
  logs: join(DATA_DIR, 'logs.json'),
  violations: join(DATA_DIR, 'violations.json'),
  whitelists: join(DATA_DIR, 'whitelists.json'),
  raidHistory: join(DATA_DIR, 'raidHistory.json'),
};

// ====================== HELPERS ======================

function readJSON(filePath) {
  try {
    if (!existsSync(filePath)) return {};
    const data = readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error(`[DB] Error reading ${filePath}: ${err.message}`);
    return {};
  }
}

function writeJSON(filePath, data) {
  try {
    writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error(`[DB] Error writing ${filePath}: ${err.message}`);
    return false;
  }
}

// ====================== INITIALIZATION ======================

let mongoClient = null;
let useMongo = false;

export async function initializeDatabase(client) {
  const MONGODB_URI = process.env.MONGODB_URI;

  if (MONGODB_URI) {
    try {
      const { MongoClient } = await import('mongodb');
      mongoClient = new MongoClient(MONGODB_URI);
      await mongoClient.connect();
      client.logger.info('[DB] MongoDB connected successfully');
      useMongo = true;
      return;
    } catch (err) {
      client.logger.warn(`[DB] MongoDB connection failed: ${err.message}. Using JSON.`);
      useMongo = false;
    }
  }

  client.logger.info('[DB] Using JSON file storage');
  useMongo = false;

  // Ensure all data files exist
  for (const [, filePath] of Object.entries(FILES)) {
    if (!existsSync(filePath)) {
      writeJSON(filePath, {});
    }
  }
}

// ====================== GUILD CONFIG ======================

export async function getGuildConfig(guildId) {
  if (useMongo && mongoClient) {
    const db = mongoClient.db('niotic');
    return db.collection('guildConfigs').findOne({ guildId });
  }

  const data = readJSON(FILES.guildConfigs);
  return data[guildId] || null;
}

export async function setGuildConfig(guildId, config) {
  if (useMongo && mongoClient) {
    const db = mongoClient.db('niotic');
    await db.collection('guildConfigs').updateOne(
      { guildId },
      { $set: { ...config, guildId } },
      { upsert: true }
    );
    return true;
  }

  const data = readJSON(FILES.guildConfigs);
  data[guildId] = { ...config, guildId };
  return writeJSON(FILES.guildConfigs, data);
}

export async function updateGuildConfig(guildId, updates) {
  const current = await getGuildConfig(guildId);
  return setGuildConfig(guildId, { ...current, ...updates });
}

// ====================== WARNINGS ======================

export async function getWarnings(guildId, userId) {
  if (useMongo && mongoClient) {
    const db = mongoClient.db('niotic');
    const result = await db.collection('warnings').findOne({ guildId, userId });
    return result?.warnings || [];
  }

  const data = readJSON(FILES.warnings);
  const key = `${guildId}:${userId}`;
  return data[key]?.warnings || [];
}

export async function addWarning(guildId, userId, warning) {
  if (useMongo && mongoClient) {
    const db = mongoClient.db('niotic');
    await db.collection('warnings').updateOne(
      { guildId, userId },
      { $push: { warnings: warning } },
      { upsert: true }
    );
    return true;
  }

  const data = readJSON(FILES.warnings);
  const key = `${guildId}:${userId}`;
  if (!data[key]) data[key] = { guildId, userId, warnings: [] };
  data[key].warnings.push(warning);
  return writeJSON(FILES.warnings, data);
}

export async function removeWarning(guildId, userId, index) {
  if (useMongo && mongoClient) {
    const db = mongoClient.db('niotic');
    const result = await db.collection('warnings').findOne({ guildId, userId });
    if (result?.warnings) {
      result.warnings.splice(index, 1);
      await db.collection('warnings').updateOne(
        { guildId, userId },
        { $set: { warnings: result.warnings } }
      );
    }
    return true;
  }

  const data = readJSON(FILES.warnings);
  const key = `${guildId}:${userId}`;
  if (data[key]?.warnings) {
    data[key].warnings.splice(index, 1);
  }
  return writeJSON(FILES.warnings, data);
}

export async function clearWarnings(guildId, userId) {
  if (useMongo && mongoClient) {
    const db = mongoClient.db('niotic');
    await db.collection('warnings').deleteOne({ guildId, userId });
    return true;
  }

  const data = readJSON(FILES.warnings);
  const key = `${guildId}:${userId}`;
  delete data[key];
  return writeJSON(FILES.warnings, data);
}

// ====================== MUTES ======================

export async function getMute(guildId, userId) {
  if (useMongo && mongoClient) {
    const db = mongoClient.db('niotic');
    return db.collection('mutes').findOne({ guildId, userId });
  }

  const data = readJSON(FILES.mutes);
  return data[`${guildId}:${userId}`] || null;
}

export async function setMute(guildId, userId, muteData) {
  if (useMongo && mongoClient) {
    const db = mongoClient.db('niotic');
    await db.collection('mutes').updateOne(
      { guildId, userId },
      { $set: { ...muteData, guildId, userId } },
      { upsert: true }
    );
    return true;
  }

  const data = readJSON(FILES.mutes);
  data[`${guildId}:${userId}`] = { ...muteData, guildId, userId };
  return writeJSON(FILES.mutes, data);
}

export async function removeMute(guildId, userId) {
  if (useMongo && mongoClient) {
    const db = mongoClient.db('niotic');
    await db.collection('mutes').deleteOne({ guildId, userId });
    return true;
  }

  const data = readJSON(FILES.mutes);
  delete data[`${guildId}:${userId}`];
  return writeJSON(FILES.mutes, data);
}

// ====================== VIOLATIONS ======================

export async function getViolations(guildId, userId) {
  if (useMongo && mongoClient) {
    const db = mongoClient.db('niotic');
    const result = await db.collection('violations').findOne({ guildId, userId });
    return result?.violations || 0;
  }

  const data = readJSON(FILES.violations);
  return data[`${guildId}:${userId}`]?.violations || 0;
}

export async function addViolation(guildId, userId, amount = 1) {
  if (useMongo && mongoClient) {
    const db = mongoClient.db('niotic');
    await db.collection('violations').updateOne(
      { guildId, userId },
      { $inc: { violations: amount } },
      { upsert: true }
    );
    return true;
  }

  const data = readJSON(FILES.violations);
  const key = `${guildId}:${userId}`;
  if (!data[key]) data[key] = { guildId, userId, violations: 0 };
  data[key].violations += amount;
  return writeJSON(FILES.violations, data);
}

export async function resetViolations(guildId, userId) {
  if (useMongo && mongoClient) {
    const db = mongoClient.db('niotic');
    await db.collection('violations').deleteOne({ guildId, userId });
    return true;
  }

  const data = readJSON(FILES.violations);
  delete data[`${guildId}:${userId}`];
  return writeJSON(FILES.violations, data);
}

// ====================== LOGS ======================

export async function addLog(guildId, logEntry) {
  if (useMongo && mongoClient) {
    const db = mongoClient.db('niotic');
    await db.collection('logs').updateOne(
      { guildId },
      { $push: { entries: logEntry } },
      { upsert: true }
    );
    return true;
  }

  const data = readJSON(FILES.logs);
  if (!data[guildId]) data[guildId] = { guildId, entries: [] };
  data[guildId].entries.unshift(logEntry);
  // Keep only last 1000 entries
  if (data[guildId].entries.length > 1000) {
    data[guildId].entries = data[guildId].entries.slice(0, 1000);
  }
  return writeJSON(FILES.logs, data);
}

export async function getLogs(guildId, limit = 100) {
  if (useMongo && mongoClient) {
    const db = mongoClient.db('niotic');
    const result = await db.collection('logs').findOne({ guildId });
    return (result?.entries || []).slice(0, limit);
  }

  const data = readJSON(FILES.logs);
  return (data[guildId]?.entries || []).slice(0, limit);
}

// ====================== RAID HISTORY ======================

export async function addRaidEvent(guildId, raidData) {
  if (useMongo && mongoClient) {
    const db = mongoClient.db('niotic');
    await db.collection('raidHistory').updateOne(
      { guildId },
      {
        $push: {
          events: {
            $each: [raidData],
            $position: 0,
            $slice: 50,
          },
        },
        $set: { guildId },
      },
      { upsert: true }
    );
    return true;
  }

  const data = readJSON(FILES.raidHistory);
  if (!data[guildId]) data[guildId] = { guildId, events: [] };
  data[guildId].events.unshift(raidData);
  if (data[guildId].events.length > 50) {
    data[guildId].events = data[guildId].events.slice(0, 50);
  }
  return writeJSON(FILES.raidHistory, data);
}

export async function getRaidHistory(guildId) {
  if (useMongo && mongoClient) {
    const db = mongoClient.db('niotic');
    const result = await db.collection('raidHistory').findOne({ guildId });
    return result?.events || [];
  }

  const data = readJSON(FILES.raidHistory);
  return data[guildId]?.events || [];
}

// ====================== WHITELIST ======================

export async function getWhitelist(guildId) {
  if (useMongo && mongoClient) {
    const db = mongoClient.db('niotic');
    const result = await db.collection('whitelists').findOne({ guildId });
    return result || { guildId, users: [], roles: [], channels: [] };
  }

  const data = readJSON(FILES.whitelists);
  return data[guildId] || { guildId, users: [], roles: [], channels: [] };
}

export async function addToWhitelist(guildId, type, id) {
  if (useMongo && mongoClient) {
    const db = mongoClient.db('niotic');
    await db.collection('whitelists').updateOne(
      { guildId },
      { $addToSet: { [type]: id } },
      { upsert: true }
    );
    return true;
  }

  const data = readJSON(FILES.whitelists);
  if (!data[guildId]) data[guildId] = { guildId, users: [], roles: [], channels: [] };
  const list = type === 'users'
    ? data[guildId].users
    : type === 'roles'
      ? data[guildId].roles
      : data[guildId].channels;

  if (!list.includes(id)) list.push(id);
  return writeJSON(FILES.whitelists, data);
}

export async function removeFromWhitelist(guildId, type, id) {
  if (useMongo && mongoClient) {
    const db = mongoClient.db('niotic');
    await db.collection('whitelists').updateOne(
      { guildId },
      { $pull: { [type]: id } }
    );
    return true;
  }

  const data = readJSON(FILES.whitelists);
  if (!data[guildId]) return true;
  const list = type === 'users'
    ? data[guildId].users
    : type === 'roles'
      ? data[guildId].roles
      : data[guildId].channels;

  const idx = list.indexOf(id);
  if (idx > -1) list.splice(idx, 1);
  return writeJSON(FILES.whitelists, data);
}
