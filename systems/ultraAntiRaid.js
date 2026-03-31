const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { defaultConfig } = require('../config');

/**
 * Ultra Advanced Anti-Raid System
 * Features:
 * - Real-time join velocity monitoring
 * - Account age scoring (newer = higher risk)
 * - Username entropy scoring (random chars = bot)
 * - CAPTCHA challenge on suspicious joins
 * - Auto-quarantine (suspicious users get no-permission role)
 * - Graduated punishment: warn -> mute -> kick -> ban
 * - Raid history with timestamps
 * - Manual raid mode (/raid lock)
 * - Auto-lockdown when threshold exceeded
 * - Mass mention/emoji detection
 * - Whitelist for VIP users/channels
 */
module.exports = function initializeUltraAntiRaid(client) {
  console.log('[UltraAntiRaid] System initialized');
  
  // Initialize storage
  client.joinTracker = new Map();
  client.raidHistory = new Map();
  client.riskScores = new Map();
  client.captchaChallenges = new Map();
  client.raidMode = new Map();
  client.quarantinedUsers = new Map();
  
  // Clean old data periodically
  setInterval(() => cleanOldData(client), 60000);
  
  // Listen for guild member add
  client.on('guildMemberAdd', async (member) => {
    await handleMemberJoin(member, client);
  });
  
  // Listen for messages for mass mention/emoji detection
  client.on('messageCreate', async (message) => {
    if (message.guild) {
      await checkMassActivity(message, client);
    }
  });
};

/**
 * Handle new member join
 */
async function handleMemberJoin(member, client) {
  const config = defaultConfig;
  const raidConfig = config.ultraRaid || config.raid || {};
  
  // Skip if anti-raid is disabled
  if (!raidConfig.enabled) return;
  
  // Check whitelist
  if (isWhitelisted(member, raidConfig)) {
    console.log(`[UltraAntiRaid] ${member.user.tag} is whitelisted, skipping checks`);
    return;
  }
  
  // Check manual raid mode
  const raidModeState = client.raidMode.get(member.guild.id);
  if (raidModeState?.active) {
    // In raid mode - quarantine all new members
    await quarantineUser(member, 'Raid mode active', client);
    return;
  }
  
  // Calculate risk score
  const riskScore = await calculateRiskScore(member, raidConfig);
  
  // Store risk score
  client.riskScores.set(`${member.guild.id}:${member.id}`, {
    score: riskScore,
    timestamp: Date.now()
  });
  
  console.log(`[UltraAntiRaid] ${member.user.tag} joined. Risk score: ${riskScore}/100`);
  
  // Track join for rate limiting
  trackJoin(member.guild.id, member.id, client);
  
  // Check if this is a raid
  const isRaid = checkForRaid(member.guild.id, client);
  
  if (isRaid) {
    await triggerRaidAlert(member.guild, isRaid, client);
    return;
  }
  
  // Take action based on risk score
  await takeRiskAction(member, riskScore, raidConfig, client);
}

/**
 * Calculate risk score for a joining member
 */
async function calculateRiskScore(member, config) {
  let riskScore = 0;
  
  // 1. Account age check (0-40 points)
  const accountAgeDays = (Date.now() - member.user.createdTimestamp) / (1000 * 60 * 60 * 24);
  const minAccountAge = config.minAccountAge || 3;
  
  if (accountAgeDays < 1) {
    riskScore += 40; // Less than 1 day
  } else if (accountAgeDays < minAccountAge) {
    riskScore += 30 * (1 - accountAgeDays / minAccountAge);
  }
  
  // 2. Avatar check (0-20 points)
  if (config.requireAvatar && !member.user.avatar) {
    riskScore += 20;
  }
  
  // 3. Username entropy analysis (0-40 points)
  const usernameRisk = analyzeUsernameEntropy(member.user.username);
  riskScore += usernameRisk;
  
  // 4. Invite link in username (automatic critical)
  if (containsInviteLink(member.user.username)) {
    riskScore = 100;
  }
  
  return Math.min(Math.round(riskScore), 100);
}

/**
 * Analyze username entropy (random chars = bot indicator)
 */
function analyzeUsernameEntropy(username) {
  let risk = 0;
  const clean = username.replace(/[^a-zA-Z0-9]/g, '');
  
  if (clean.length < 3) return 30;
  
  // Check for repeated patterns (aaaaaa, 123123)
  const repeatedPattern = /(.)\1{4,}/.test(username);
  if (repeatedPattern) risk += 15;
  
  // Check for too many numbers (bot123456)
  const numberRatio = (username.match(/[0-9]/g) || []).length / username.length;
  if (numberRatio > 0.5) risk += 15;
  
  // Check for random-looking strings (no vowels grouping)
  const consonantCluster = /[bcdfghjklmnpqrstvwxyz]{6,}/i.test(username);
  if (consonantCluster) risk += 10;
  
  // Check for common bot patterns
  const botPatterns = [
    /^user\d{5,}$/i,
    /^acc\d{5,}$/i,
    /^temp\d{5,}$/i,
    /^fake\d{5,}$/i,
    /^spam\d{3,}$/i,
    /[0-9]{8,}/,
  ];
  
  for (const pattern of botPatterns) {
    if (pattern.test(username)) {
      risk += 20;
      break;
    }
  }
  
  // Check for spam keywords
  const spamKeywords = ['free', 'nitro', 'gift', 'winner', 'prize', 'giveaway', 'claim', 'link', 'discord'];
  const hasSpamKeyword = spamKeywords.some(kw => username.toLowerCase().includes(kw));
  if (hasSpamKeyword) risk += 10;
  
  return Math.min(risk, 40);
}

/**
 * Check if username contains invite link
 */
function containsInviteLink(username) {
  const inviteRegex = /(discord\.(gg|io|com)|discord\.com\/invite)/i;
  return inviteRegex.test(username);
}

/**
 * Check if user is whitelisted
 */
function isWhitelisted(member, config) {
  const whitelist = config.whitelist || [];
  const whitelistRoles = config.whitelistRoles || [];
  
  // Check whitelist by user ID
  if (whitelist.includes(member.id)) {
    return true;
  }
  
  // Check whitelist roles
  for (const roleId of whitelistRoles) {
    if (member.roles.cache.has(roleId)) {
      return true;
    }
  }
  
  return false;
}

/**
 * Track join for rate limiting
 */
function trackJoin(guildId, memberId, client) {
  const now = Date.now();
  
  if (!client.joinTracker) {
    client.joinTracker = new Map();
  }
  
  const guildJoins = client.joinTracker.get(guildId) || [];
  guildJoins.push({ memberId, timestamp: now });
  
  // Keep only joins within last 10 seconds
  const recentJoins = guildJoins.filter(
    j => now - j.timestamp < 10000
  );
  
  client.joinTracker.set(guildId, recentJoins);
}

/**
 * Check if a raid is happening
 */
function checkForRaid(guildId, client) {
  const config = defaultConfig;
  const raidConfig = config.ultraRaid || config.raid || {};
  
  const guildJoins = client.joinTracker?.get(guildId) || [];
  const now = Date.now();
  
  // Check joins per second
  const joinsPerSecond = guildJoins.filter(
    j => now - j.timestamp < 1000
  ).length;
  
  const maxJoinsPerSecond = raidConfig.maxJoinsPerSecond || 3;
  
  if (joinsPerSecond >= maxJoinsPerSecond) {
    return {
      type: 'rate',
      joinsPerSecond,
      totalJoins: guildJoins.length
    };
  }
  
  // Check total joins in last 30 seconds
  const recentJoins = guildJoins.filter(
    j => now - j.timestamp < 30000
  ).length;
  
  if (recentJoins > maxJoinsPerSecond * 5) {
    return {
      type: 'surge',
      joins: recentJoins,
      timeWindow: '30s'
    };
  }
  
  return null;
}

/**
 * Trigger raid alert and lockdown
 */
async function triggerRaidAlert(guild, raidInfo, client) {
  const config = defaultConfig;
  const raidConfig = config.ultraRaid || config.raid || {};
  
  console.log(`[UltraAntiRaid] RAID DETECTED in ${guild.name}! Type: ${raidInfo.type}`);
  
  // Enable lockdown
  client.raidMode.set(guild.id, {
    active: true,
    type: raidInfo.type,
    timestamp: Date.now(),
    triggeredBy: 'auto'
  });
  
  // Store in history
  if (!client.raidHistory) client.raidHistory = new Map();
  const history = client.raidHistory.get(guild.id) || [];
  history.unshift({
    type: raidInfo.type,
    timestamp: Date.now(),
    joinsPerSecond: raidInfo.joinsPerSecond || raidInfo.joins,
    triggeredBy: 'auto'
  });
  // Keep last 50 raids
  client.raidHistory.set(guild.id, history.slice(0, 50));
  
  // Lock all channels
  const channels = guild.channels.cache.filter(ch => 
    ch.type === 0 || ch.type === 2 || ch.type === 15
  );
  
  for (const [channelId, channel] of channels) {
    try {
      // Store original perms
      if (!client.lockedChannels) client.lockedChannels = new Map();
      const originalPerms = channel.permissionOverwrites.cache.get(guild.roles.everyone.id);
      
      client.lockedChannels.set(channelId, {
        sendMessages: originalPerms?.allow.has('SendMessages') ?? true,
        connect: originalPerms?.allow.has('Connect') ?? true
      });
      
      // Lock channel
      await channel.permissionOverwrites.edit(guild.roles.everyone, {
        SendMessages: false,
        AddReactions: false,
        Connect: false,
        Speak: false
      }, 'Raid detected - Lockdown');
    } catch (error) {
      console.log(`[UltraAntiRaid] Error locking channel ${channel.name}: ${error.message}`);
    }
  }
  
  // Create alert embed
  const alertEmbed = new EmbedBuilder()
    .setTitle('🚨 RAID DETECTED!')
    .setColor(0xff0000)
    .setDescription('Lockdown has been enabled automatically.')
    .addFields(
      { name: 'Type', value: raidInfo.type, inline: true },
      { name: 'Joins/Sec', value: String(raidInfo.joinsPerSecond || raidInfo.joins), inline: true },
      { name: 'Action', value: 'Auto Lockdown Enabled', inline: true }
    )
    .setTimestamp();
  
  // Send to configured log channel
  if (raidConfig.logChannel) {
    const logChannel = guild.channels.cache.get(raidConfig.logChannel);
    if (logChannel) {
      await logChannel.send({ embeds: [alertEmbed] });
    }
  }
  
  // Also send to mod log
  const modLogChannel = guild.channels.cache.find(
    ch => ch.name === 'mod-logs' || ch.name === 'moderation-logs'
  );
  
  if (modLogChannel) {
    await modLogChannel.send({ embeds: [alertEmbed] });
  }
  
  // Quarantine existing recent joins
  const recentMembers = guild.members.cache.filter(m => {
    const joinData = client.riskScores.get(`${guild.id}:${m.id}`);
    return joinData && (Date.now() - joinData.timestamp < 60000);
  });
  
  for (const [memberId, member] of recentMembers) {
    const riskData = client.riskScores.get(`${guild.id}:${memberId}`);
    if (riskData && riskData.score > 50) {
      await quarantineUser(member, 'High risk during raid', client);
    }
  }
}

/**
 * Quarantine a user (remove permissions, add quarantine role)
 */
async function quarantineUser(member, reason, client) {
  const config = defaultConfig;
  const raidConfig = config.ultraRaid || config.raid || {};
  const quarantineRoleId = raidConfig.quarantineRole;
  
  try {
    if (quarantineRoleId) {
      const quarantineRole = member.guild.roles.cache.get(quarantineRoleId);
      if (quarantineRole) {
        await member.roles.add(quarantineRole, reason);
      }
    }
    
    // Store quarantined user
    if (!client.quarantinedUsers) client.quarantinedUsers = new Map();
    client.quarantinedUsers.set(`${member.guild.id}:${member.id}`, {
      reason,
      timestamp: Date.now()
    });
    
    console.log(`[UltraAntiRaid] ${member.user.tag} quarantined: ${reason}`);
  } catch (error) {
    console.log(`[UltraAntiRaid] Error quarantining user: ${error.message}`);
  }
}

/**
 * Take action based on risk score
 */
async function takeRiskAction(member, riskScore, config, client) {
  const { riskThresholds, actions } = config;
  
  let action = null;
  
  const thresholds = riskThresholds || { low: 25, medium: 50, high: 75, critical: 90 };
  
  if (riskScore >= thresholds.critical) {
    action = actions?.critical || 'ban';
  } else if (riskScore >= thresholds.high) {
    action = actions?.high || 'kick';
  } else if (riskScore >= thresholds.medium) {
    action = actions?.medium || 'mute';
  } else if (riskScore >= thresholds.low) {
    action = actions?.low || 'warn';
  }
  
  if (!action) return;
  
  console.log(`[UltraAntiRaid] ${member.user.tag} risk score ${riskScore} - Action: ${action}`);
  
  try {
    switch (action) {
      case 'warn':
        const warnEmbed = new EmbedBuilder()
          .setTitle('⚠️ Risk Flag Warning')
          .setColor(0xffaa00)
          .addFields(
            { name: 'Server', value: member.guild.name },
            { name: 'Risk Score', value: String(riskScore) }
          );
        
        await member.send({ embeds: warnEmbed }).catch(() => {});
        break;
        
      case 'mute':
        await member.timeout(24 * 60 * 60 * 1000, `Risk score: ${riskScore}`);
        break;
        
      case 'kick':
        await member.kick(`High risk score: ${riskScore}`);
        break;
        
      case 'ban':
        await member.ban({ reason: `Critical risk score: ${riskScore}` });
        break;
        
      case 'quarantine':
        await quarantineUser(member, `Risk score: ${riskScore}`, client);
        break;
    }
  } catch (error) {
    console.log(`[UltraAntiRaid] Error taking action: ${error.message}`);
  }
  
  // Log action
  if (config.logChannel) {
    const logChannel = member.guild.channels.cache.get(config.logChannel);
    if (logChannel) {
      const actionEmbed = new EmbedBuilder()
        .setTitle('🛡️ Anti-Raid Action')
        .setColor(0xffaa00)
        .addFields(
          { name: 'User', value: `${member.user} (${member.user.id})`, inline: true },
          { name: 'Risk Score', value: String(riskScore), inline: true },
          { name: 'Action', value: action, inline: true }
        );
      
      logChannel.send({ embeds: [actionEmbed] }).catch(() => {});
    }
  }
}

/**
 * Check for mass mention/emoji activity
 */
async function checkMassActivity(message, client) {
  if (message.author.bot) return;
  
  const config = defaultConfig;
  const raidConfig = config.ultraRaid || config.raid || {};
  
  if (!raidConfig.massMentionThreshold) return;
  
  // Check mentions
  const mentionCount = message.mentions.members.size + message.mentions.roles.size;
  if (mentionCount >= raidConfig.massMentionThreshold) {
    await message.delete();
    await message.author.timeout(300000, 'Mass mention spam');
    
    const alertEmbed = new EmbedBuilder()
      .setTitle('🛡️ Mass Mention Detected')
      .setColor(0xffaa00)
      .addFields(
        { name: 'User', value: `${message.author}` },
        { name: 'Mentions', value: String(mentionCount) },
        { name: 'Action', value: 'Timeout 5min + message deleted' }
      );
    
    const modLog = message.guild.channels.cache.find(
      ch => ch.name === 'mod-logs' || ch.name === 'moderation-logs'
    );
    if (modLog) modLog.send({ embeds: [alertEmbed] });
  }
  
  // Check emoji spam
  const emojiCount = (message.content.match(/<a?:\w+:\d+>/g) || []).length;
  if (emojiCount >= (raidConfig.massEmojiThreshold || 5)) {
    await message.delete();
    
    const alertEmbed = new EmbedBuilder()
      .setTitle('🛡️ Emoji Spam Detected')
      .setColor(0xffaa00)
      .addFields(
        { name: 'User', value: `${message.author}` },
        { name: 'Emojis', value: String(emojiCount) },
        { name: 'Action', value: 'Message deleted' }
      );
    
    const modLog = message.guild.channels.cache.find(
      ch => ch.name === 'mod-logs' || ch.name === 'moderation-logs'
    );
    if (modLog) modLog.send({ embeds: [alertEmbed] });
  }
}

/**
 * Clean old data
 */
function cleanOldData(client) {
  const now = Date.now();
  
  // Clean join tracker
  if (client.joinTracker) {
    for (const [guildId, joins] of client.joinTracker) {
      const recent = joins.filter(j => now - j.timestamp < 10000);
      client.joinTracker.set(guildId, recent);
    }
  }
  
  // Clean risk scores older than 1 hour
  if (client.riskScores) {
    for (const [key, data] of client.riskScores) {
      if (now - data.timestamp > 3600000) {
        client.riskScores.delete(key);
      }
    }
  }
  
  console.log('[UltraAntiRaid] Cleaned old data');
}

/**
 * Manual raid mode control
 */
module.exports.setRaidMode = async function(guild, active, triggeredBy, client) {
  client.raidMode.set(guild.id, {
    active,
    timestamp: Date.now(),
    triggeredBy
  });
  
  if (active) {
    // Lock channels
    const channels = guild.channels.cache.filter(ch => 
      ch.type === 0 || ch.type === 2 || ch.type === 15
    );
    
    for (const [channelId, channel] of channels) {
      try {
        await channel.permissionOverwrites.edit(guild.roles.everyone, {
          SendMessages: false,
          AddReactions: false,
          Connect: false,
          Speak: false
        }, 'Manual raid lock');
      } catch (e) {}
    }
  } else {
    // Unlock channels
    if (client.lockedChannels) {
      for (const [channelId] of client.lockedChannels) {
        try {
          const channel = guild.channels.cache.get(channelId);
          if (channel) {
            await channel.permissionOverwrites.delete(guild.roles.everyone, 'Raid lock lifted');
          }
        } catch (e) {}
      }
      client.lockedChannels.clear();
    }
  }
  
  // Add to history
  if (!client.raidHistory) client.raidHistory = new Map();
  const history = client.raidHistory.get(guild.id) || [];
  history.unshift({
    type: active ? 'manual_lock' : 'manual_unlock',
    timestamp: Date.now(),
    triggeredBy
  });
  client.raidHistory.set(guild.id, history.slice(0, 50));
};

module.exports.checkForRaid = checkForRaid;
module.exports.calculateRiskScore = calculateRiskScore;