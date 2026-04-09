/**
 * Niotic - Discord Moderation Bot
 * Main entry point
 */

import 'dotenv/config';
import { Client, GatewayIntentBits, Partials, Collection } from 'discord.js';
import { readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import db, { getGuildConfig } from './database/db.js';
import { setupRaidHandler } from './handlers/raidHandler.js';
import { setupRaidDetector } from './handlers/raidDetector.js';
import { setLogClient } from './utils/logManager.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Create client with all intents
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildModeration,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.GuildVoiceStates,
  ],
  partials: [Partials.Channel, Partials.Message, Partials.User],
});

// Collections
client.commands = new Collection();
client.buttonHandlers = new Map();
client.selectMenuHandlers = new Map();
client.modalHandlers = new Map();
client.raidMode = new Map();
client.derankTracker = new Map();
client.violationScores = new Map();
client.guildConfigs = new Map();
client.joinTracker = new Map();
client.logger = {
  info: (...args) => console.log('[INFO]', ...args),
  warn: (...args) => console.warn('[WARN]', ...args),
  error: (...args) => console.error('[ERROR]', ...args),
};

// Load all commands
async function loadCommands() {
  const folders = ['moderation', 'config', 'utility', 'info', 'protection', 'automation', 'stats'];
  for (const folder of folders) {
    try {
      const path = join(__dirname, 'commands', folder);
      const files = readdirSync(path).filter(f => f.endsWith('.js'));
      for (const file of files) {
        try {
          const cmd = await import(`./commands/${folder}/${file}`);
          if (cmd.default?.name) {
            client.commands.set(cmd.default.name, cmd.default);
            console.log(`[Load] /${cmd.default.name} (${folder})`);
          }
        } catch (e) {
          console.error(`[Load Error] ${folder}/${file}: ${e.message}`);
        }
      }
    } catch {}
  }
  console.log(`[Commands] Loaded ${client.commands.size} commands`);
}

// Load events
async function loadEvents() {
  const eventsPath = join(__dirname, 'events');
  const files = readdirSync(eventsPath).filter(f => f.endsWith('.js'));
  for (const file of files) {
    try {
      const event = await import(`./events/${file}`);
      if (event.default?.name && event.default?.execute) {
        if (event.default.once) {
          client.once(event.default.name, (...args) => event.default.execute(...args, client));
        } else {
          client.on(event.default.name, (...args) => event.default.execute(...args, client));
        }
        console.log(`[Event] ${event.default.name}`);
      }
    } catch (e) {
      console.error(`[Event Error] ${file}: ${e.message}`);
    }
  }
}

// Ready event
client.once('ready', async (c) => {
  console.log(`✅ Logged in as ${c.user.tag}`);
  console.log(`📊 Serving ${c.guilds.cache.size} servers`);
  c.user.setActivity('/help | Niotic Moderation', { type: 3 });

  // Initialize log manager with client
  setLogClient(c);

  // Initialize raid handler
  setupRaidHandler(c);

  // Initialize raid detector
  setupRaidDetector(c);

  // Pre-load guild configs
  for (const guild of c.guilds.cache.values()) {
    try {
      const config = getGuildConfig(guild.id);
      c.guildConfigs.set(guild.id, config);
    } catch {}
  }
});

// Start
async function start() {
  await loadCommands();
  await loadEvents();
  
  const token = process.env.DISCORD_TOKEN;
  if (!token) {
    console.error('❌ DISCORD_TOKEN not set!');
    process.exit(1);
  }
  
  client.login(token).catch(err => {
    console.error('❌ Login failed:', err.message);
    process.exit(1);
  });
}

start();

export default client;
