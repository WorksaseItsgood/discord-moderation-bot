const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { defaultConfig } = require('../config');

/**
 * AutoMod System
 * Features:
 * - Anti-spam (rate limit messages)
 * - Anti-links (block Discord invites, configurable)
 * - Anti-swear (word filter with bypass roles)
 * - Anti-caps (excessive caps detection)
 * - Anti-mention spam (too many mentions)
 * - Anti-emoji spam
 * - Anti-image spam (image-only messages)
 * - Anti-scams (common scam patterns)
 * - Custom word/phrase blacklist
 * - Punishment scaling (1st=warn, 2nd=mute, 3rd=kick, etc.)
 * - Warnings expiry (auto-remove after X days)
 */
module.exports = function initializeAutoMod(client) {
  console.log('[AutoMod] System initialized');
  
  // Initialize storage
  client.messageTracker = new Map();
  client.automodWarnings = new Map();
  client.spamDetection = new Map();
  
  // Custom blacklist from config
  client.customBlacklist = new Set((defaultConfig.automod?.blacklist || [])
    .map(w => w.toLowerCase()));
  
  // Common scam patterns
  client.scamPatterns = [
    /free.?nitro/i,
    /discord.?nitro.?free/i,
    /claim.?prize/i,
    /verify.?account/i,
    /confirm.?identity/i,
    /suspicious.?activity/i,
    /account.?compromised/i,
    /click.?here.?to.?claim/i,
    /limited.?time.?offer/i,
    /verify.?to.?win/i,
  ];
  
  // Listen for messages
  client.on('messageCreate', async (message) => {
    await processMessage(message, client);
  });
  
  // Listen for message updates (edit)
  client.on('messageUpdate', async (oldMessage, newMessage) => {
    if (newMessage && !newMessage.author?.bot) {
      await processMessage(newMessage, client);
    }
  });
  
  // Clean old data periodically
  setInterval(() => cleanAutomodData(client), 60000);
  
  // Clean expired warnings
  setInterval(() => cleanExpiredWarnings(client), 3600000);
};

/**
 * Process incoming message for automod checks
 */
async function processMessage(message, client) {
  // Skip bots
  if (message.author?.bot) return;
  
  // Skip if no guild
  if (!message.guild) return;
  
  // Skip if message is too short
  if (!message.content || message.content.length < 2) return;
  
  const config = defaultConfig;
  const automodConfig = config.automod || {};
  
  // Check if automod is enabled
  if (!automodConfig.enabled) return;
  
  // Check bypass roles
  if (hasBypassRole(message.member, automodConfig)) {
    return;
  }
  
  const content = message.content;
  const channel = message.channel;
  const member = message.member;
  
  let violation = null;
  let deleteMessage = false;
  let takeAction = false;
  let actionType = null;
  
  // 1. Anti-spam (rate limiting)
  if (automodConfig.antiSpam !== false) {
    const spamCheck = checkSpam(message, client, automodConfig);
    if (spamCheck.violation) {
      violation = spamCheck;
      takeAction = true;
      actionType = 'spam';
    }
  }
  
  // 2. Anti-links (Discord invites)
  if (automodConfig.antiLinks !== false) {
    const linkCheck = checkLinks(content, automodConfig);
    if (linkCheck.violation) {
      violation = linkCheck;
      deleteMessage = true;
      takeAction = true;
      actionType = 'links';
    }
  }
  
  // 3. Anti-swear / bad words
  if (automodConfig.antiSwear !== false) {
    const swearCheck = checkBadWords(content, client, automodConfig);
    if (swearCheck.violation) {
      violation = swearCheck;
      deleteMessage = true;
      takeAction = true;
      actionType = 'swear';
    }
  }
  
  // 4. Anti-caps
  if (automodConfig.antiCaps !== false) {
    const capsCheck = checkCaps(content, automodConfig);
    if (capsCheck.violation) {
      violation = capsCheck;
      takeAction = true;
      actionType = 'caps';
    }
  }
  
  // 5. Anti-mention spam
  if (automodConfig.antiMention !== false) {
    const mentionCheck = checkMentions(message, automodConfig);
    if (mentionCheck.violation) {
      violation = mentionCheck;
      deleteMessage = true;
      takeAction = true;
      actionType = 'mention';
    }
  }
  
  // 6. Anti-emoji spam
  if (automodConfig.antiEmoji !== false) {
    const emojiCheck = checkEmojiSpam(content, automodConfig);
    if (emojiCheck.violation) {
      violation = emojiCheck;
      deleteMessage = true;
      takeAction = true;
      actionType = 'emoji';
    }
  }
  
  // 7. Anti-image spam
  if (automodConfig.antiImageSpam !== false) {
    const imageCheck = checkImageSpam(message, automodConfig);
    if (imageCheck.violation) {
      violation = imageCheck;
      deleteMessage = true;
      takeAction = true;
      actionType = 'image';
    }
  }
  
  // 8. Anti-scams
  if (automodConfig.antiScam !== false) {
    const scamCheck = checkScams(content, client);
    if (scamCheck.violation) {
      violation = scamCheck;
      deleteMessage = true;
      takeAction = true;
      actionType = 'scam';
    }
  }
  
  // 9. Custom blacklist
  if (automodConfig.blacklist?.length > 0) {
    const blacklistCheck = checkBlacklist(content, client, automodConfig);
    if (blacklistCheck.violation) {
      violation = blacklistCheck;
      deleteMessage = true;
      takeAction = true;
      actionType = 'blacklist';
    }
  }
  
  // Handle violation
  if (takeAction && violation) {
    await handleViolation(message, violation, actionType, client);
  }
}

/**
 * Check for spam (rate limiting)
 */
function checkSpam(message, client, config) {
  const userId = message.author.id;
  const channelId = message.channel.id;
  const key = `${message.guild.id}:${userId}:${channelId}`;
  
  if (!client.messageTracker) {
    client.messageTracker = new Map();
  }
  
  const now = Date.now();
  const userMessages = client.messageTracker.get(key) || [];
  
  // Add current message
  userMessages.push({ timestamp: now, content: message.content });
  
  // Keep only messages within the time window
  const timeWindow = (config.spamTimeWindow || 5) * 1000;
  const recentMessages = userMessages.filter(m => now - m.timestamp < timeWindow);
  
  client.messageTracker.set(key, recentMessages);
  
  const maxMessages = config.maxMessages || 5;
  
  if (recentMessages.length > maxMessages) {
    // Check for duplicate messages
    const isDuplicate = recentMessages.slice(0, -1).some(m => m.content === message.content);
    
    return {
      violation: true,
      type: 'spam',
      reason: `Sent ${recentMessages.length} messages in ${config.spamTimeWindow || 5}s (max: ${maxMessages})`,
      details: isDuplicate ? 'Duplicate messages detected' : 'Too many messages'
    };
  }
  
  return { violation: false };
}

/**
 * Check for Discord invites
 */
function checkLinks(content, config) {
  // Allow if user has permission
  if (config.allowLinks) return { violation: false };
  
  // Discord invite regex
  const inviteRegex = /(discord\.(gg|io|com)\/invite\/|discord\.com\/invite)/i;
  
  if (inviteRegex.test(content)) {
    return {
      violation: true,
      type: 'links',
      reason: 'Discord invite links are not allowed',
      details: content.match(inviteRegex)?.[0]
    };
  }
  
  // Check for other links
  const linkRegex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/g;
  
  if (config.blockAllLinks && linkRegex.test(content)) {
    return {
      violation: true,
      type: 'links',
      reason: 'Links are not allowed in this channel',
      details: 'URL detected'
    };
  }
  
  return { violation: false };
}

/**
 * Check for bad words
 */
function checkBadWords(content, client, config) {
  const badWords = config.badWords || [
    'nigger', 'faggot', 'nigga', 'retard', 'tranny', 'faggot', 'cunt', 'dyke'
  ];
  
  const lowerContent = content.toLowerCase();
  const words = lowerContent.split(/\s+/);
  
  for (const word of words) {
    // Check direct match
    if (badWords.includes(word)) {
      return {
        violation: true,
        type: 'swear',
        reason: 'Inappropriate language detected',
        details: `Word: ${word}`
      };
    }
    
    // Check partial match
    for (const bad of badWords) {
      if (word.includes(bad) && bad.length > 2) {
        return {
          violation: true,
          type: 'swear',
          reason: 'Inappropriate language detected',
          details: `Match: ${bad}`
        };
      }
    }
  }
  
  return { violation: false };
}

/**
 * Check for excessive caps
 */
function checkCaps(content, config) {
  if (content.length < (config.minLength || 10)) {
    return { violation: false };
  }
  
  const upperCount = (content.match(/[A-Z]/g) || []).length;
  const totalCount = content.replace(/[^a-zA-Z]/g, '').length;
  
  if (totalCount < 5) return { violation: false };
  
  const ratio = upperCount / totalCount;
  const maxCapsRatio = config.maxCapsRatio || 0.7;
  
  if (ratio > maxCapsRatio && upperCount > (config.minCapsCount || 10)) {
    return {
      violation: true,
      type: 'caps',
      reason: 'Excessive caps detected',
      details: `${Math.round(ratio * 100)}% caps (max: ${Math.round(maxCapsRatio * 100)}%)`
    };
  }
  
  return { violation: false };
}

/**
 * Check for mention spam
 */
function checkMentions(message, config) {
  const mentionCount = message.mentions.members.size + 
    message.mentions.roles.size + 
    message.mentions.users.size;
  
  const maxMentions = config.maxMentions || 5;
  
  if (mentionCount > maxMentions) {
    return {
      violation: true,
      type: 'mention',
      reason: `Too many mentions (${mentionCount}, max: ${maxMentions})`,
      details: 'Mass mention spam'
    };
  }
  
  return { violation: false };
}

/**
 * Check for emoji spam
 */
function checkEmojiSpam(content, config) {
  // Match custom emojis
  const customEmojis = content.match(/<a?:\w+:\d+>/g) || [];
  // Match unicode emojis (basic set)
  const unicodeEmojis = content.match(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu) || [];
  
  const totalEmojis = customEmojis.length + unicodeEmojis.length;
  const maxEmojis = config.maxEmojis || 8;
  
  if (totalEmojis > maxEmojis) {
    return {
      violation: true,
      type: 'emoji',
      reason: `Too many emojis (${totalEmojis}, max: ${maxEmojis})`,
      details: 'Emoji spam'
    };
  }
  
  return { violation: false };
}

/**
 * Check for image spam (only images, no text)
 */
function checkImageSpam(message, config) {
  // Check if message has attachments
  if (message.attachments.size === 0) {
    return { violation: false };
  }
  
  // Check for image-only messages
  const hasImage = message.attachments.some(a => 
    a.contentType && a.contentType.startsWith('image/')
  );
  
  if (!hasImage) return { violation: false };
  
  // Check if there's actual text content
  const hasText = message.content && message.content.trim().length > 10;
  
  const minTextLength = config.minTextLength || 10;
  
  if (!hasText || message.content.trim().length < minTextLength) {
    return {
      violation: true,
      type: 'image',
      reason: 'Image-only messages with little text are not allowed',
      details: 'Image spam'
    };
  }
  
  return { violation: false };
}

/**
 * Check for scam patterns
 */
function checkScams(content, client) {
  for (const pattern of client.scamPatterns) {
    if (pattern.test(content)) {
      return {
        violation: true,
        type: 'scam',
        reason: 'Potential scam detected',
        details: pattern.toString()
      };
    }
  }
  
  return { violation: false };
}

/**
 * Check custom blacklist
 */
function checkBlacklist(content, client, config) {
  const lowerContent = content.toLowerCase();
  
  for (const word of client.customBlacklist) {
    if (lowerContent.includes(word)) {
      return {
        violation: true,
        type: 'blacklist',
        reason: 'Blacklisted word detected',
        details: `Word: ${word}`
      };
    }
  }
  
  return { violation: false };
}

/**
 * Check if member has bypass role
 */
function hasBypassRole(member, config) {
  if (!member) return false;
  
  const bypassRoles = config.bypassRoles || [];
  
  for (const roleId of bypassRoles) {
    if (member.roles.cache.has(roleId)) {
      return true;
    }
  }
  
  return false;
}

/**
 * Handle violation with scaling punishment
 */
async function handleViolation(message, violation, type, client) {
  const config = defaultConfig;
  const automodConfig = config.automod || {};
  
  const userId = message.author.id;
  const guildId = message.guild.id;
  const warningKey = `${guildId}:${userId}`;
  
  // Get warning count
  if (!client.automodWarnings) {
    client.automodWarnings = new Map();
  }
  
  const userWarnings = client.automodWarnings.get(warningKey) || {
    count: 0,
    violations: [],
    firstViolation: Date.now(),
    lastViolation: Date.now()
  };
  
  // Add new violation
  userWarnings.count++;
  userWarnings.violations.push({
    type,
    timestamp: Date.now()
  });
  userWarnings.lastViolation = Date.now();
  
  client.automodWarnings.set(warningKey, userWarnings);
  
  // Determine action based on warning count
  const action = determineAction(userWarnings.count, automodConfig);
  
  // Take action
  const member = message.member;
  
  try {
    switch (action) {
      case 'warn':
        if (member) {
          const dmEmbed = new EmbedBuilder()
            .setTitle('⚠️ AutoMod Warning')
            .setColor(0xffaa00)
            .addFields(
              { name: 'Violation', value: violation.reason },
              { name: 'Count', value: String(userWarnings.count) }
            );
          
          await member.send({ embeds: dmEmbed }).catch(() => {});
        }
        break;
        
      case 'mute':
        if (member) {
          await member.timeout(300000, violation.reason);
        }
        break;
        
      case 'kick':
        if (member) {
          await member.kick(violation.reason);
        }
        break;
        
      case 'ban':
        if (member) {
          await member.ban({ reason: violation.reason });
        }
        break;
    }
  } catch (error) {
    console.log(`[AutoMod] Error taking action: ${error.message}`);
  }
  
  // Delete message if needed
  if (violation.type && ['links', 'swear', 'scam', 'blacklist', 'emoji', 'image'].includes(violation.type)) {
    try {
      await message.delete();
    } catch (e) {}
  }
  
  // Log to mod channel
  const logEmbed = new EmbedBuilder()
    .setTitle('🛡️ AutoMod Action')
    .setColor(0xffaa00)
    .addFields(
      { name: 'User', value: `${message.author} (${message.author.id})`, inline: true },
      { name: 'Type', value: violation.type, inline: true },
      { name: 'Action', value: action, inline: true },
      { name: 'Reason', value: violation.reason },
      { name: 'Warning Count', value: String(userWarnings.count), inline: true }
    )
    .setTimestamp();
  
  const modLog = message.guild.channels.cache.find(
    ch => ch.name === 'mod-logs' || ch.name === 'moderation-logs'
  );
  
  if (modLog) {
    await modLog.send({ embeds: [logEmbed] }).catch(() => {});
  }
}

/**
 * Determine action based on warning count
 */
function determineAction(count, config) {
  const actions = config.actions || {
    1: 'warn',
    2: 'warn',
    3: 'mute',
    4: 'kick',
    5: 'ban'
  };
  
  // Find the action for this count or higher
  const sortedCounts = Object.keys(actions).map(Number).sort((a, b) => a - b);
  
  for (const c of sortedCounts) {
    if (count >= c) {
      return actions[c];
    }
  }
  
  return actions[1] || 'warn';
}

/**
 * Clean old automod tracking data
 */
function cleanAutomodData(client) {
  const now = Date.now();
  
  if (client.messageTracker) {
    for (const [key, messages] of client.messageTracker) {
      // Keep only messages from last 30 seconds
      const recent = messages.filter(m => now - m.timestamp < 30000);
      if (recent.length === 0) {
        client.messageTracker.delete(key);
      } else {
        client.messageTracker.set(key, recent);
      }
    }
  }
  
  console.log('[AutoMod] Cleaned tracking data');
}

/**
 * Clean expired warnings
 */
function cleanExpiredWarnings(client) {
  if (!client.automodWarnings) return;
  
  const config = defaultConfig;
  const automodConfig = config.automod || {};
  const expiryDays = automodConfig.warningExpiryDays || 7;
  const expiryMs = expiryDays * 24 * 60 * 60 * 1000;
  
  const now = Date.now();
  
  for (const [key, data] of client.automodWarnings) {
    if (now - data.lastViolation > expiryMs) {
      client.automodWarnings.delete(key);
    }
  }
  
  console.log('[AutoMod] Cleaned expired warnings');
}

// Export for config
module.exports.checkBadWords = checkBadWords;
module.exports.checkScams = checkScams;
module.exports.checkLinks = checkLinks;