const { EmbedBuilder } = require('discord.js');
const { defaultConfig } = require('../config');

/**
 * Message Create Event - Auto-moderation and message logging
 */
module.exports = {
  name: 'messageCreate',
  once: false,
  async execute(message, client) {
    // Ignore bots and DMs
    if (message.author.bot || !message.guild) return;
    
    const guildConfig = defaultConfig;
    const autoModConfig = guildConfig.autoMod || {};
    
    // Anti-Spam check
    if (autoModConfig.spam?.enabled) {
      await checkSpam(message, client, autoModConfig.spam);
    }
    
    // Anti-Invite check
    if (autoModConfig.antiInvite?.enabled) {
      await checkAntiInvite(message, client, autoModConfig.antiInvite);
    }
    
    // Anti-Scam check
    if (autoModConfig.antiScam?.enabled) {
      await checkAntiScam(message, client, autoModConfig.antiScam);
    }
    
    // Anti-Swear / Word Filter
    if (autoModConfig.antiSwear?.enabled) {
      await checkAntiSwear(message, client, autoModConfig.antiSwear);
    }
    
    // Anti-Mention-Spam
    if (autoModConfig.mentionSpam?.enabled) {
      await checkMentionSpam(message, client, autoModConfig.mentionSpam);
    }
    
    // Anti-Caps
    if (autoModConfig.antiCaps?.enabled) {
      await checkAntiCaps(message, client, autoModConfig.antiCaps);
    }
    
    // Anti-Emoji-Spam
    if (autoModConfig.emojiSpam?.enabled) {
      await checkEmojiSpam(message, client, autoModConfig.emojiSpam);
    }
    
    // Anti-Image-Spam
    if (autoModConfig.imageSpam?.enabled) {
      await checkImageSpam(message, client, autoModConfig.imageSpam);
    }
    
    // Anti-Link
    if (autoModConfig.antiLink?.enabled) {
      await checkAntiLink(message, client, autoModConfig.antiLink);
    }
    
    // Log message to message log channel
    if (guildConfig.logging?.enabled && guildConfig.logging?.messages) {
      await logMessage(message);
    }
  }
};

// Anti-Spam function
async function checkSpam(message, client, config) {
  const userId = message.author.id;
  const now = Date.now();
  
  // Initialize spam tracking
  if (!client.spamTracker) {
    client.spamTracker = new Map();
  }
  
  const userMessages = client.spamTracker.get(userId) || [];
  
  // Filter messages within time window
  const recentMessages = userMessages.filter(
    m => now - m.timestamp < config.maxInterval
  );
  
  recentMessages.push({ timestamp: now, content: message.content });
  
  if (recentMessages.length > config.maxMessages) {
    // User is spamming
    await handleViolation(message, client, config.action, 'Spam detected');
  }
  
  client.spamTracker.set(userId, recentMessages);
  
  // Clean old entries
  setTimeout(() => {
    const cleaned = recentMessages.filter(
      m => now - m.timestamp < config.maxInterval * 2
    );
    if (cleaned.length === 0) {
      client.spamTracker.delete(userId);
    }
  }, config.maxInterval * 2);
}

// Anti-Invite function
async function checkAntiInvite(message, client, config) {
  const inviteRegex = /(discord\.(gg|io|com)\/[\w-]+|discord\.com\/invite\/[\w-]+)/gi;
  const matches = message.content.match(inviteRegex);
  
  if (matches) {
    // Check if invite is allowed
    for (const invite of matches) {
      if (config.allowedInvites?.includes(invite)) {
        continue;
      }
      await handleViolation(message, client, config.action, 'Discord invite link detected');
      return;
    }
  }
}

// Anti-Scam function
async function checkAntiScam(message, client, config) {
  const content = message.content.toLowerCase();
  
  for (const pattern of config.patterns) {
    if (content.includes(pattern.toLowerCase())) {
      await handleViolation(message, client, config.action, 'Scam pattern detected');
      return;
    }
  }
}

// Anti-Swear function
async function checkAntiSwear(message, client, config) {
  // Check bypass roles
  if (config.bypassRoles?.length > 0) {
    const member = message.member;
    for (const roleId of config.bypassRoles) {
      if (member?.roles?.cache?.has(roleId)) {
        return;
      }
    }
  }
  
  const content = message.content.toLowerCase();
  
  for (const word of config.words) {
    if (content.includes(word.toLowerCase())) {
      await handleViolation(message, client, config.action, 'Blocked word detected');
      return;
    }
  }
}

// Anti-Mention-Spam function
async function checkMentionSpam(message, client, config) {
  const mentions = message.mentions.users.size + message.mentions.roles.size;
  
  if (mentions > config.maxMentions) {
    await handleViolation(message, client, config.action, 'Mention spam detected');
  }
}

// Anti-Caps function
async function checkAntiCaps(message, client, config) {
  const content = message.content;
  
  if (content.length < config.minLength) return;
  
  const capsCount = (content.match(/[A-Z]/g) || []).length;
  const capsRatio = capsCount / content.length;
  
  if (capsRatio > config.maxCapsRatio) {
    await handleViolation(message, client, config.action, 'Excessive caps detected');
  }
}

// Anti-Emoji-Spam function
async function checkEmojiSpam(message, client, config) {
  const emojiRegex = /[\u{1F300}-\u{1F9FF}]|[\u{1F600}-\u{1F64F}]|[\u{1F680}-\u{1F6FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu;
  const emojis = message.content.match(emojiRegex) || [];
  
  if (emojis.length > config.maxEmojis) {
    await handleViolation(message, client, config.action, 'Emoji spam detected');
  }
}

// Anti-Image-Spam function
async function checkImageSpam(message, client, config) {
  const hasImage = message.attachments.some(
    a => a.contentType?.startsWith('image/')
  );
  
  if (!hasImage) return;
  
  const now = Date.now();
  
  if (!client.imageSpamTracker) {
    client.imageSpamTracker = new Map();
  }
  
  const userImages = client.imageSpamTracker.get(message.author.id) || [];
  const recentImages = userImages.filter(
    i => now - i.timestamp < config.interval
  );
  
  if (recentImages.length >= config.maxImages) {
    await handleViolation(message, client, config.action, 'Image spam detected');
  }
  
  recentImages.push({ timestamp: now });
  client.imageSpamTracker.set(message.author.id, recentImages);
}

// Anti-Link function
async function checkAntiLink(message, client, config) {
  // Check bypass roles
  if (config.bypassRoles?.length > 0) {
    const member = message.member;
    for (const roleId of config.bypassRoles) {
      if (member?.roles?.cache?.has(roleId)) {
        return;
      }
    }
  }
  
  const urlRegex = /(https?:\/\/[^\s]+)/gi;
  const links = message.content.match(urlRegex);
  
  if (links) {
    for (const link of links) {
      const isAllowed = config.allowedDomains?.some(
        domain => link.includes(domain)
      );
      
      if (!isAllowed) {
        await handleViolation(message, client, config.action, 'Blocked link detected');
        return;
      }
    }
  }
}

// Handle violation
async function handleViolation(message, client, action, reason) {
  console.log(`[AutoMod] ${message.author.tag}: ${reason}`);
  
  let actionTaken = false;
  
  try {
    switch (action) {
      case 'delete':
        await message.delete();
        actionTaken = true;
        break;
        
      case 'warn':
        await message.delete();
        // Add warning (simplified, would normally call warn command)
        actionTaken = true;
        break;
        
      case 'mute':
        await message.delete();
        if (message.member) {
          await message.member.timeout(60000, reason); // 1 minute timeout
        }
        actionTaken = true;
        break;
        
      case 'kick':
        await message.delete();
        if (message.member?.kickable) {
          await message.member.kick(reason);
        }
        actionTaken = true;
        break;
        
      case 'ban':
        await message.delete();
        if (message.member?.bannable) {
          await message.guild.bans.create(message.author, { reason: reason });
        }
        actionTaken = true;
        break;
    }
  } catch (error) {
    console.error(`[AutoMod] Error taking action: ${error.message}`);
  }
  
  // Log to mod log channel
  if (actionTaken) {
    const logChannel = message.guild.channels.cache.find(
      ch => ch.name === 'mod-logs' || ch.name === 'moderation-logs'
    );
    
    if (logChannel) {
      const embed = new EmbedBuilder()
        .setTitle('🤖 Auto-Moderation Action')
        .setColor(0xffaa00)
        .addFields(
          { name: 'User', value: `${message.author} (${message.author.id})`, inline: true },
          { name: 'Action', value: action, inline: true },
          { name: 'Reason', value: reason, inline: true }
        );
      
      await logChannel.send({ embeds: [embed] }).catch(() => {});
    }
  }
}

// Log message to message log channel
async function logMessage(message) {
  const config = defaultConfig;
  const logChannel = message.guild.channels.cache.get(config.logging.messages);
  
  if (!logChannel) return;
  
  const embed = new EmbedBuilder()
    .setTitle('💬 New Message')
    .setColor(0x00ff00)
    .setTimestamp()
    .addFields(
      { name: 'Author', value: `${message.author} (${message.author.id})`, inline: true },
      { name: 'Channel', value: message.channel.toString(), inline: true }
    )
    .setDescription(message.content.length > 1000 
      ? message.content.substring(0, 1000) + '...' 
      : message.content);
  
  await logChannel.send({ embeds: [embed] }).catch(() => {});
}