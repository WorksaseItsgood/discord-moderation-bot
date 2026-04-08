require('dotenv').config();
const { Client, GatewayIntentBits, Partials } = require('discord.js');
const fs = require('fs');
const path = require('path');

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
  partials: [Partials.Message, Partials.Channel, Partials.Reaction, Partials.GuildMember, Partials.User]
});

// Client maps
client.commands = new Map();
client.cooldowns = new Map();
client.raidConfig = new Map();
client.shieldConfig = new Map();
client.shieldLocked = new Map();

// Load systems
const systems = {};
for (const file of fs.readdirSync('./systems').filter(f => f.endsWith('.js'))) {
  try {
    systems[file.replace('.js', '')] = require(`./systems/${file}`);
  } catch (e) { console.log(`[System] Error: ${e.message}`); }
}
client.modules = systems;

// Load commands (only existing folders)
const commandFolders = ['moderation', 'utility'];
for (const folder of commandFolders) {
  const folderPath = `./commands/${folder}`;
  if (!fs.existsSync(folderPath)) continue;
  for (const file of fs.readdirSync(folderPath).filter(f => f.endsWith('.js'))) {
    try {
      const cmd = require(`${folderPath}/${file}`);
      client.commands.set(cmd.name || cmd.data?.name, cmd);
    } catch (e) { console.log(`[Command] Error: ${file} - ${e.message}`); }
  }
}

// Load shield command
try {
  const shield = require('./commands/shield.js');
  client.commands.set('shield', shield);
} catch (e) { console.log(`[Command] Error: shield - ${e.message}`); }

// Load events
for (const file of fs.readdirSync('./events').filter(f => f.endsWith('.js'))) {
  try {
    const event = require(`./events/${file}`);
    if (event.once) {
      client.once(event.name, (...args) => event.execute(...args, client));
    } else {
      client.on(event.name, (...args) => event.execute(...args, client));
    }
  } catch (e) { console.log(`[Event] Error: ${file} - ${e.message}`); }
}

// Init systems
if (systems.ultraShield) systems.ultraShield(client);
if (systems.ultraAntiRaid) systems.ultraAntiRaid(client);
if (systems.logger) try { systems.logger(client); } catch {}
if (systems.database) try { systems.database(client); } catch {}

// Login
client.login(process.env.DISCORD_TOKEN);

client.on('ready', async () => {
  console.log(`[Bot] Logged in as ${client.user.tag} | ${client.commands.size} commands`);
  
  // Register slash commands
  try {
    const { REST } = require('@discordjs/rest');
    const { Routes } = require('discord-api-types/v10');
    const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
    const cmds = [];
    client.commands.forEach((cmd) => { if (cmd.data) cmds.push(cmd.data.toJSON()); });
    await rest.put(Routes.applicationCommands(client.user.id), { body: cmds });
    console.log(`[Bot] Registered ${cmds.length} slash commands`);
  } catch (e) { console.log(`[Bot] Command registration error: ${e.message}`); }
});

// Command handler
client.on('interactionCreate', async (interaction) => {
  if (interaction.isChatInputCommand()) {
    const cmd = client.commands.get(interaction.commandName);
    if (!cmd) return;
    
    const key = `${interaction.user.id}-${cmd.name}`;
    if (client.cooldowns.has(key)) {
      const last = client.cooldowns.get(key);
      if (Date.now() - last < (cmd.cooldown || 3000)) {
        return interaction.reply({ content: '⏳ Attends...', ephemeral: true });
      }
    }
    client.cooldowns.set(key, Date.now());
    
    try {
      await cmd.execute(interaction, client);
    } catch (e) {
      console.log(`[Command] Error: ${e.message}`);
      interaction.reply({ content: '❌ Erreur: ' + e.message, ephemeral: true }).catch(() => {});
    }
  }
});

process.on('unhandledRejection', (e) => console.log('[Error]', e.message));
process.on('uncaughtException', (e) => console.log('[Error]', e.message));

console.log('[Bot] Starting...');
