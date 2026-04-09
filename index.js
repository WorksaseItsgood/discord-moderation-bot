/**
 * Niotic - Discord Moderation Bot
 * Main entry point (ES Module)
 */

import 'dotenv/config';
import { Client, GatewayIntentBits, Partials, Collection, REST, Routes } from 'discord.js';
import { readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import db, { getGuildConfig } from './src/database/db.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Create client
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildModeration,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.DirectMessages,
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
client.antiSpam = new Map();
client.logger = {
  info: (...args) => console.log('[INFO]', ...args),
  warn: (...args) => console.warn('[WARN]', ...args),
  error: (...args) => console.error('[ERROR]', ...args),
};

// Load commands
async function loadCommands() {
  const folders = ['moderation', 'config', 'utility', 'info', 'protection', 'automation', 'stats'];
  let count = 0;
  for (const folder of folders) {
    try {
      const path = join(__dirname, 'src', 'commands', folder);
      const files = readdirSync(path).filter(f => f.endsWith('.js'));
      for (const file of files) {
        try {
          const cmd = await import(`./src/commands/${folder}/${file}`);
          if (cmd.default?.name) {
            client.commands.set(cmd.default.name, cmd.default);
            count++;
          }
        } catch (e) {
          console.error(`[Load Error] ${folder}/${file}: ${e.message}`);
        }
      }
    } catch {}
  }
  console.log(`[Commands] Loaded ${count} commands`);
  return count;
}

// Register slash commands with Discord
async function registerCommands() {
  const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
  const commands = client.commands.map(cmd => cmd.data?.toJSON ? cmd.data.toJSON() : cmd.data).filter(Boolean);

  try {
    console.log(`[Deploy] Registering ${commands.length} slash commands...`);
    await rest.put(
      Routes.applicationCommands(client.user.id),
      { body: commands }
    );
    console.log(`[Deploy] ✅ ${commands.length} commands deployed to Discord!`);
  } catch (err) {
    console.error('[Deploy] ❌ Failed to deploy commands:', err.message);
  }
}

// Load events
async function loadEvents() {
  const files = readdirSync(join(__dirname, 'src', 'events')).filter(f => f.endsWith('.js'));
  for (const file of files) {
    try {
      const event = await import(`./src/events/${file}`);
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

// Ready
client.once('ready', async (c) => {
  console.log(`✅ Logged in as ${c.user.tag}`);
  console.log(`📊 Serving ${c.guilds.cache.size} servers`);
  c.user.setActivity('/help | Niotic Moderation', { type: 3 });

  // Deploy slash commands to Discord
  await registerCommands();

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
