require('dotenv').config();
const { Client, GatewayIntentBits, Partials, ModalBuilder, TextInputStyle, TextInputBuilder, ActionRowBuilder } = require('discord.js');
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
client.pollData = new Map();
client.pendingVerification = new Map();

// Load commands - all folders
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

// Load commands
function loadCommands() {
  console.log('[Bot] Loading commands...');
  
  for (const folder of commandFolders) {
    const commandPath = path.join(__dirname, 'commands', folder);
    if (!fs.existsSync(commandPath)) {
      console.log(`[Command] Folder not found: ${folder}`);
      continue;
    }
    
    const files = fs.readdirSync(commandPath).filter(file => file.endsWith('.js'));
    console.log(`[Command] Loading ${files.length} commands from ${folder}...`);
    
    for (const file of files) {
      try {
        const command = require(path.join(commandPath, file));
        client.commands.set(command.data.name, command);
        console.log(`[Command] Loaded: ${command.data.name}`);
      } catch (error) {
        console.log(`[Command] Error loading ${file}: ${error.message}`);
      }
    }
  }
  
  console.log(`[Bot] Total commands loaded: ${client.commands.size}`);
}

// Load events
function loadEvents() {
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
}

// Load systems
function loadSystems() {
  console.log('[Bot] Loading systems...');
  
  // Initialize anti-raid system
  try {
    require('./systems/antiRaid')(client);
    console.log('[System] Loaded: antiRaid');
  } catch (e) {
    console.log('[System] Error loading antiRaid:', e.message);
  }
  
  // Initialize logger system
  try {
    require('./systems/logger')(client);
    console.log('[System] Loaded: logger');
  } catch (e) {
    console.log('[System] Error loading logger:', e.message);
  }
  
  // Initialize database system
  try {
    require('./systems/database')(client);
    console.log('[System] Loaded: database');
  } catch (e) {
    console.log('[System] Error loading database:', e.message);
  }
  
  // Initialize welcome system
  try {
    require('./systems/welcome')(client);
    console.log('[System] Loaded: welcome');
  } catch (e) {
    console.log('[System] Error loading welcome:', e.message);
  }
  
  // Initialize starboard system
  try {
    require('./systems/starboard')(client);
    console.log('[System] Loaded: starboard');
  } catch (e) {
    console.log('[System] Error loading starboard:', e.message);
  }
  
  // Initialize music system (optional - requires distube)
  try {
    require('./systems/music')(client);
    console.log('[System] Loaded: music');
  } catch (e) {
    console.log('[System] Music not loaded (distube may not be installed):', e.message);
  }
  
  // Initialize Ultra Anti-Raid System
  try {
    require('./systems/ultraAntiRaid')(client);
    console.log('[System] Loaded: ultraAntiRaid');
  } catch (e) {
    console.log('[System] Error loading ultraAntiRaid:', e.message);
  }
  
  // Initialize AutoMod System
  try {
    const AutoModSystem = require('./systems/autoMod');
    client.autoMod = new AutoModSystem(client);
    console.log('[System] Loaded: autoMod');
  } catch (e) {
    console.log('[System] Error loading autoMod:', e.message);
  }
}

// Handle interactions - unified handler
async function handleInteraction(interaction) {
  // Handle modal submissions
  if (interaction.isModalSubmit()) {
    if (interaction.customId === 'verify-modal') {
      const code = interaction.fields.getTextInputValue('code');
      const storedCode = client.pendingVerification.get(interaction.user.id);
      
      if (code && code.toUpperCase() === storedCode?.toUpperCase()) {
        // Correct! Verify user
        client.dbManager.verifyCode(interaction.user.id, interaction.guildId, code);
        
        const verifyRole = client.dbManager.getSetting('verify_role', interaction.guildId);
        if (verifyRole) {
          const role = interaction.guild.roles.cache.get(verifyRole);
          if (role) {
            await interaction.member.roles.add(role);
          }
        }
        
        await interaction.reply({ content: '✅ Verification complete! You are now verified.', ephemeral: true });
      } else {
        await interaction.reply({ content: '❌ Wrong code! Use /verify to try again.', ephemeral: true });
      }
      
      client.pendingVerification.delete(interaction.user.id);
      return;
    }
  }
  
  // Handle button interactions
  if (interaction.isButton()) {
    // Ticket close button
    if (interaction.customId === 'ticket-close') {
      try {
        const ticket = client.dbManager.getTicket(interaction.channel.id, interaction.guildId);
        if (ticket) {
          client.dbManager.closeTicket(interaction.channel.id, interaction.guildId);
          await interaction.reply('🔒 Ticket closing...');
          setTimeout(async () => {
            try {
              await interaction.channel.delete();
            } catch (e) {}
          }, 3000);
        }
      } catch (e) {
        console.error('[Button] Error:', e);
      }
      return;
    }
    
    // Poll votes
    if (interaction.customId.startsWith('poll-')) {
      const poll = client.pollData.get(interaction.message.id);
      if (poll) {
        const index = parseInt(interaction.customId.split('-')[1]);
        
        // Check if already voted
        if (poll.voters.has(interaction.user.id)) {
          await interaction.reply({ content: 'You already voted!', ephemeral: true });
          return;
        }
        
        poll.votes[index]++;
        poll.voters.set(interaction.user.id, index);
        
        await interaction.reply({ content: `Voted for ${poll.options[index]}!`, ephemeral: true });
      }
      return;
    }
    
    // Verify submit button - show modal
    if (interaction.customId === 'verify-submit') {
      const modal = new ModalBuilder()
        .setCustomId('verify-modal')
        .setTitle('🔐 Verification');
      
      const codeInput = new TextInputBuilder()
        .setCustomId('code')
        .setLabel('Enter verification code')
        .setStyle(TextInputStyle.Short)
        .setPlaceholder('Enter the code from /verify')
        .setMinLength(6)
        .setMaxLength(6)
        .setRequired(true);
      
      const row = new ActionRowBuilder().addComponents(codeInput);
      modal.addComponents(row);
      
      await interaction.showModal(modal);
      return;
    }
    
    // Handle help buttons
    if (interaction.customId.startsWith('help-')) {
      const category = interaction.customId.replace('help-', '');
      await executeHelpCategory(interaction, category);
      return;
    }
    
    // Ticket category buttons
    if (interaction.customId.startsWith('ticket-')) {
      // Category is selected - store and prompt for reason (simplified)
      const category = interaction.customId.replace('ticket-', '');
      await interaction.reply({ 
        content: `Category: ${category}. Please use \`/ticket-create category:${category} reason:your-issue\` to create ticket.`, 
        ephemeral: true 
      });
      return;
    }
  }
  
  // Handle slash commands
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
}

// Execute help for category
async function executeHelpCategory(interaction, category) {
  const categories = {
    moderation: {
      title: '🛡️ Moderation Commands',
      commands: '/ban, /unban, /kick, /mute, /unmute, /warn, /warnings, /clearwarns, /lock, /unlock, /slowmode, /purge, /role'
    },
    economy: {
      title: '💰 Economy Commands',
      commands: '/balance, /daily, /weekly, /beg, /gamble, /rob, /pay, /rank, /leaderboard'
    },
    music: {
      title: '🎵 Music Commands',
      commands: '/play, /stop, /skip, /queue, /volume'
    },
    tickets: {
      title: '🎫 Ticket Commands',
      commands: '/ticket-create, /ticket-close, /ticket-add, /ticket-remove, /ticket-panel'
    },
    utility: {
      title: '🔧 Utility Commands',
      commands: '/server-info, /user-info, /avatar, /banner, /role-info, /channel-info, /emojis, /poll, /ping, /bot-stats'
    },
    game: {
      title: '🎮 Game Commands',
      commands: '/8ball, /rps'
    }
  };
  
  const cat = categories[category];
  if (!cat) return;
  
  const { EmbedBuilder } = require('discord.js');
  const embed = new EmbedBuilder()
    .setTitle(cat.title)
    .setDescription(cat.commands)
    .setColor(0x0099ff);
  
  await interaction.reply({ embeds: [embed], ephemeral: true });
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

// Handle all interactions
client.on('interactionCreate', handleInteraction);

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n[Bot] Shutting down gracefully...');
  
  // Close database
  if (client.dbManager) {
    client.dbManager.closeAll();
  }
  
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