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
    GatewayIntentBits.MessageContent
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

// Load commands
function loadCommands() {
  const commandFolders = ['moderation', 'config', 'info'];
  
  for (const folder of commandFolders) {
    const commandPath = path.join(__dirname, 'commands', folder);
    if (!fs.existsSync(commandPath)) continue;
    
    const files = fs.readdirSync(commandPath).filter(file => file.endsWith('.js'));
    for (const file of files) {
      const command = require(path.join(commandPath, file));
      client.commands.set(command.data.name, command);
      console.log(`[Command] Loaded: ${command.data.name}`);
    }
  }
}

// Load events
function loadEvents() {
  const eventFiles = fs.readdirSync('./events').filter(file => file.endsWith('.js'));
  
  for (const file of eventFiles) {
    const event = require(`./events/${file}`);
    const eventName = file.replace('.js', '');
    
    if (event.once) {
      client.once(eventName, (...args) => event.execute(...args, client));
    } else {
      client.on(eventName, (...args) => event.execute(...args, client));
    }
    console.log(`[Event] Loaded: ${eventName}`);
  }
}

// Load systems
function loadSystems() {
  // Initialize anti-raid system
  require('./systems/antiRaid')(client);
  console.log('[System] Loaded: antiRaid');
  
  // Initialize logger system
  require('./systems/logger')(client);
  console.log('[System] Loaded: logger');
}

// Login to Discord
client.once('ready', async () => {
  console.log(`[Bot] Logged in as ${client.user.tag}`);
  console.log(`[Bot] Serving ${client.guilds.cache.size} servers`);
  
  // Load commands, events, and systems
  loadCommands();
  loadEvents();
  loadSystems();
  
  // Register slash commands globally (optional - can be per-guild)
  if (config.registerCommandsGlobally) {
    try {
      await client.application.commands.set(Array.from(client.commands.values()).map(cmd => cmd.data));
      console.log('[Bot] Slash commands registered globally');
    } catch (error) {
      console.error('[Bot] Failed to register global commands:', error);
    }
  }
  
  // Set bot status
  client.user.setActivity(config.status || ' moderation help');
});

// Handle interactions
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand()) return;
  
  const command = client.commands.get(interaction.commandName);
  if (!command) return;
  
  // Check permissions
  if (!interaction.guild) {
    return interaction.reply({ content: 'This command can only be used in a server!', ephemeral: true });
  }
  
  const member = interaction.member;
  const requiredPermissions = command.permissions || [];
  
  for (const perm of requiredPermissions) {
    if (!member.permissions.has(perm)) {
      return interaction.reply({
        content: `You need ${perm} permission to use this command!`,
        ephemeral: true
      });
    }
  }
  
  try {
    await command.execute(interaction, client);
  } catch (error) {
    console.error(`[Error] Command ${interaction.commandName}:`, error);
    const errorMsg = config.debug ? error.message : 'An error occurred while executing this command.';
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({ content: errorMsg, ephemeral: true });
    } else {
      await interaction.reply({ content: errorMsg, ephemeral: true });
    }
  }
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n[Bot] Shutting down gracefully...');
  
  // Unlock all locked channels
  for (const [channelId, originalPerms] of client.lockedChannels) {
    try {
      const channel = client.channels.cache.get(channelId);
      if (channel) {
        await channel.permissionOverwrites.edit(channel.guild.roles.everyone, {
          SendMessages: originalPerms
        });
      }
    } catch (error) {
      console.error(`[Error] Unlocking channel ${channelId}:`, error);
    }
  }
  
  await client.destroy();
  process.exit(0);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('[Error] Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('[Error] Uncaught Exception:', error);
  process.exit(1);
});

// Login
client.login(config.token);