const fs = require('fs');
const path = require('path');

// Default configuration
const defaultConfig = {
  // Bot token (set via environment variable or .env file)
  token: process.env.DISCORD_TOKEN || process.env.TOKEN || '',
  
  // Client ID for command registration
  clientId: process.env.CLIENT_ID || '',
  
  // Bot owner IDs (array of user IDs)
  owners: process.env.OWNERS ? process.env.OWNERS.split(',') : [],
  
  // Debug mode
  debug: process.env.DEBUG === 'true' || false,
  
  // Register commands globally (vs per-guild)
  registerCommandsGlobally: process.env.GLOBAL_COMMANDS === 'true' || false,
  
  // Bot status
  status: process.env.STATUS || ' moderation.help',
  
  // Prefix for legacy commands (optional)
  prefix: process.env.PREFIX || '!',
  
  // Default raid configuration
  raid: {
    enabled: true,
    maxJoinsPerSecond: 5,
    minAccountAge: 7, // days
    requireAvatar: true,
    riskThresholds: {
      low: 30,
      medium: 60,
      high: 80,
      critical: 100
    },
    actions: {
      low: 'warn',
      medium: 'mute',
      high: 'kick',
      critical: 'ban'
    },
    // Whitelist: users exempt from anti-raid (by ID)
    whitelist: [],
    // Whitelist roles: roles exempt from anti-raid
    whitelistRoles: [],
    // Whitelist channels: channels exempt from anti-raid
    whitelistChannels: [],
    // Raid log channel ID
    logChannel: null
  },
  
  // Default auto-moderation configuration
  autoMod: {
    enabled: true,
    // Anti-spam settings
    spam: {
      enabled: true,
      maxMessages: 5,
      maxInterval: 3000, // ms
      action: 'delete' // delete, warn, mute, kick, ban
    },
    // Anti-invite settings
    antiInvite: {
      enabled: true,
      allowedInvites: [], // Array of allowed invite codes
      action: 'delete' // delete, warn, mute, kick, ban
    },
    // Anti-scam settings
    antiScam: {
      enabled: true,
      patterns: [
        'nitro free',
        'free nitro',
        'discord gift',
        'steam gift',
        ' Valorant free',
        'fortnite free',
        'apple gift card',
        'google play card'
      ],
      action: 'ban'
    },
    // Anti-swear / word filter
    antiSwear: {
      enabled: false,
      words: ['badword1', 'badword2'], // Add your blocked words
      action: 'delete', // delete, warn, mute
      bypassRoles: [] // Roles that can bypass filter
    },
    // Anti-mention-spam
    mentionSpam: {
      enabled: true,
      maxMentions: 5,
      interval: 5000, // ms
      action: 'mute' // mute, kick, ban
    },
    // Anti-caps
    antiCaps: {
      enabled: true,
      minLength: 5,
      maxCapsRatio: 0.7,
      action: 'delete'
    },
    // Anti-emoji-spam
    emojiSpam: {
      enabled: true,
      maxEmojis: 5,
      action: 'delete'
    },
    // Anti-image-spam
    imageSpam: {
      enabled: true,
      maxImages: 3,
      interval: 5000, // ms
      action: 'mute'
    },
    // Anti-link
    antiLink: {
      enabled: false,
      allowedDomains: [], // e.g., ['discord.com', 'youtube.com']
      action: 'delete',
      bypassRoles: []
    }
  },
  
  // Default logging configuration
  logging: {
    enabled: true,
    // Log channel IDs per feature
    moderation: null,
    messages: null,
    members: null,
    voice: null,
    channels: null
  },
  
  // Moderation defaults
  moderation: {
    // Default mute role ID (create this role in your server)
    muteRole: null,
    // DM users when they're moderated
    dmOnAction: true,
    // Default ban delete days
    banDeleteDays: 0,
    // Default warn expiry days
    warnExpiryDays: 30
  }
};

// Load config from file or environment
function loadConfig(guildId) {
  // Start with default config
  let config = { ...defaultConfig };
  
  // Override with environment variables
  if (process.env.DISCORD_TOKEN) config.token = process.env.DISCORD_TOKEN;
  if (process.env.CLIENT_ID) config.clientId = process.env.CLIENT_ID;
  
  // Check for guild-specific config file
  const configPath = path.join(__dirname, 'configs', `${guildId}.json`);
  
  if (fs.existsSync(configPath)) {
    try {
      const guildConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      config = mergeDeep(config, guildConfig);
      console.log(`[Config] Loaded configuration for guild ${guildId}`);
    } catch (error) {
      console.error(`[Config] Error loading guild config:`, error);
    }
  }
  
  return config;
}

// Deep merge utility
function mergeDeep(target, source) {
  const output = { ...target };
  
  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach(key => {
      if (isObject(source[key])) {
        if (!(key in target)) {
          Object.assign(output, { [key]: source[key] });
        } else {
          output[key] = mergeDeep(target[key], source[key]);
        }
      } else {
        Object.assign(output, { [key]: source[key] });
      }
    });
  }
  
  return output;
}

function isObject(item) {
  return item && typeof item === 'object' && !Array.isArray(item);
}

// Save guild config
function saveGuildConfig(guildId, guildConfig) {
  const configDir = path.join(__dirname, 'configs');
  
  // Create configs directory if it doesn't exist
  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true });
  }
  
  const configPath = path.join(configDir, `${guildId}.json`);
  fs.writeFileSync(configPath, JSON.stringify(guildConfig, null, 2));
  console.log(`[Config] Saved configuration for guild ${guildId}`);
}

// Get configuration for a specific guild
function getGuildConfig(client, guildId) {
  // Check if config is cached in memory
  if (client.raidConfig.has(guildId)) {
    return client.raidConfig.get(guildId);
  }
  
  // Load from file
  const config = loadConfig(guildId);
  client.raidConfig.set(guildId, config);
  return config;
}

// Export functions
module.exports = {
  defaultConfig,
  loadConfig,
  saveGuildConfig,
  getGuildConfig,
  mergeDeep
};