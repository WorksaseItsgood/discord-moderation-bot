require('dotenv').config();
const { Client, GatewayIntentBits, Partials } = require('discord.js');
const fs = require('fs');
const path = require('path');

// Load configuration
const config = require('./config');

// Initialize client with intents
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildBans,
    GatewayIntentBits.GuildWebhooks,
    GatewayIntentBits.GuildEmojisAndStickers
  ],
  partials: [
    Partials.Message,
    Partials.Channel,
    Partials.Reaction,
    Partials.GuildMember,
    Partials.User
  ]
});

// Global variables
client.commands = new Map();
client.cooldowns = new Map();
client.raidConfig = new Map();
client.autoModConfig = new Map();
client.warnings = new Map();
client.lockedChannels = new Map();
client.pollData = new Map();
client.pendingVerification = new Map();

// ========== LOAD SYSTEMS FIRST ==========
console.log('[Bot] Loading systems...');
const systems = {};
const systemFiles = fs.readdirSync('./systems').filter(file => file.endsWith('.js'));

for (const file of systemFiles) {
  try {
    const system = require(`./systems/${file}`);
    const systemName = file.replace('.js', '');
    systems[systemName] = system;
    console.log(`[System] Loaded: ${systemName}`);
  } catch (error) {
    console.log(`[System] Error loading ${file}: ${error.message}`);
  }
}

// Store systems in client
client.modules = systems;

// ========== LOAD COMMANDS ==========
const commandFolders = [
  'moderation',
  'config',
  'info',
  'economy',
  'fun',
  'music',
  'tickets',
  'verification',
  'giveaway',
  'suggestion',
  'utility',
  'game',
  'social',
  'image',
  'sound'
];

console.log('[Bot] Loading commands...');

for (const folder of commandFolders) {
  const commandPath = path.join(__dirname, 'commands', folder);
  if (!fs.existsSync(commandPath)) continue;

  const files = fs.readdirSync(commandPath).filter(file => file.endsWith('.js'));

  for (const file of files) {
    try {
      const command = require(path.join(commandPath, file));
      client.commands.set(command.name || command.data?.name, command);
      console.log(`[Command] Loaded: ${file.replace('.js', '')}`);
    } catch (error) {
      console.log(`[Command] Error loading ${file}: ${error.message}`);
    }
  }
}

// Add UltraShield command
try {
  const shieldCommand = require('./commands/shield.js');
  client.commands.set('shield', shieldCommand);
  console.log('[Command] Loaded: shield');
} catch (error) {
  console.log(`[Command] Error loading shield: ${error.message}`);
}

console.log(`[Bot] Total commands loaded: ${client.commands.size}`);

// ========== LOAD EVENTS ==========
console.log('[Bot] Loading events...');

const eventFiles = fs.readdirSync('./events').filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
  try {
    const event = require(`./events/${file}`);
    const eventName = file.replace('.js', '');

    if (event.once) {
      client.once(eventName, (...args) => event.execute(...args, client));
    } else {
      client.on(eventName, (...args) => event.execute(...args, client));
    }
    console.log(`[Event] Loaded: ${eventName}`);
  } catch (error) {
    console.log(`[Event] Error loading ${file}: ${error.message}`);
  }
}

// Load shield-buttons event separately
try {
  const extraEvent = require('./events/shield-buttons.js');
  client.on('interactionCreate', (...args) => extraEvent.execute(...args, client));
  console.log('[Event] Loaded: shield-buttons');
} catch (error) {
  console.log(`[Event] Error loading shield-buttons: ${error.message}`);
}

// ========== INITIALIZE SYSTEMS ==========
// Initialize UltraShield
if (systems.ultraShield) {
  systems.ultraShield(client);
}

// Initialize UltraAntiRaid
if (systems.ultraAntiRaid) {
  systems.ultraAntiRaid(client);
}

// Initialize AutoMod
if (systems.autoMod) {
  systems.autoMod(client);
}

// Initialize other systems
if (systems.logger) {
  try { systems.logger(client); } catch {}
}
if (systems.database) {
  try { systems.database(client); } catch {}
}

// ========== LOGIN ==========
client.on('ready', async () => {
  console.log(`[Bot] Logged in as ${client.user.tag}`);
  console.log(`[Bot] Serving ${client.guilds.cache.size} servers`);

  // Register slash commands globally
  try {
    const { REST } = require('@discordjs/rest');
    const { Routes } = require('discord-api-types/v10');

    const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

    const commands = [];
    client.commands.forEach((cmd) => {
      if (cmd.data) commands.push(cmd.data.toJSON());
    });

    await rest.put(
      Routes.applicationCommands(client.user.id),
      { body: commands }
    );

    console.log(`[Bot] Registered ${commands.length} slash commands`);
  } catch (error) {
    console.log(`[Bot] Error registering commands: ${error.message}`);
  }
});

// ========== COMMAND HANDLER ==========
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  // Cooldown check
  const key = `${interaction.user.id}-${command.name}`;
  if (client.cooldowns.has(key)) {
    const lastUse = client.cooldowns.get(key);
    if (Date.now() - lastUse < (command.cooldown || 3000)) {
      return interaction.reply({ content: '⏳ Attends un peu...', ephemeral: true });
    }
  }
  client.cooldowns.set(key, Date.now());

  try {
    await command.execute(interaction, client);
  } catch (error) {
    console.log(`[Command] Error: ${error.message}`);
    if (interaction.replied) {
      interaction.followUp({ content: '❌ Erreur executing la commande.', ephemeral: true });
    } else {
      interaction.reply({ content: '❌ Erreur: ' + error.message, ephemeral: true });
    }
  }
});

// Handle button interactions
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isButton() && !interaction.isSelectMenu()) return;

  // Shield buttons are handled by the event
});

// ========== ERROR HANDLING ==========
process.on('unhandledRejection', (error) => {
  console.log('[Error] Unhandled rejection:', error.message);
});

process.on('uncaughtException', (error) => {
  console.log('[Error] Uncaught exception:', error.message);
});

// ========== LOGIN ==========
client.login(process.env.DISCORD_TOKEN);

console.log('[Bot] Starting up...');