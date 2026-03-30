const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { defaultConfig } = require('../config');

/**
 * Anti-Raid System
 * Detects and protects against raid attacks
 */
module.exports = function initializeAntiRaid(client) {
  console.log('[AntiRaid] System initialized');
  
  // Join tracking for rate limiting
  client.joinTracker = new Map();
  client.raidAlerts = new Map();
  client.riskScores = new Map();
  
  // Listen for guild member add
  client.on('guildMemberAdd', async (member) => {
    await handleMemberJoin(member, client);
  });
};

/**
 * Handle new member join - check for raid indicators
 */
async function handleMemberJoin(member, client) {
  const config = defaultConfig;
  const raidConfig = config.raid || {};
  
  // Skip if anti-raid is disabled
  if (!raidConfig.enabled) return;
  
  // Check whitelist
  if (isWhitelisted(member, raidConfig)) {
    console.log(`[AntiRaid] ${member.user.tag} is whitelisted, skipping checks`);
    return;
  }
  
  // Calculate risk score
  const riskScore = await calculateRiskScore(member, raidConfig);
  
  // Store risk score
  if (!client.riskScores) client.riskScores = new Map();
  client.riskScores.set(member.id, riskScore);
  
  console.log(`[AntiRaid] ${member.user.tag} joined. Risk score: ${riskScore}/100`);
  
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
  
  if (accountAgeDays < 1) {
    riskScore += 40; // Less than 1 day
  } else if (accountAgeDays < config.minAccountAge) {
    riskScore += 30 * (1 - accountAgeDays / config.minAccountAge);
  }
  
  // 2. Avatar check (0-20 points)
  if (config.requireAvatar && !member.user.avatar) {
    riskScore += 20;
  }
  
  // 3. Username analysis (0-40 points)
  const usernameRisk = analyzeUsername(member.user.username);
  riskScore += usernameRisk;
  
  // 4. Invite link in username (automatic critical)
  if (containsInviteLink(member.user.username)) {
    riskScore = 100;
  }
  
  return Math.min(Math.round(riskScore), 100);
}

/**
 * Analyze username for spam patterns
 */
function analyzeUsername(username) {
  let risk = 0;
  const lower = username.toLowerCase();
  
  // Check for common spam patterns
  const patterns = [
    { pattern: /(.)\1{5,}/, risk: 20 }, // Repeated characters
    { pattern: /[0-9]{8,}/, risk: 15 }, // Too many numbers
    { pattern: /^[a-z]{1,3}[0-9]{4,}/i, risk: 15 }, // Letter-number combo
    { pattern: /(free|nitro|gift|winner|prize)/i, risk: 10 }, // Spam keywords
    { pattern: /[a-z]{20,}/i, risk: 10 }, // Long string of letters
  ];
  
  for (const { pattern, risk: patternRisk } of patterns) {
    if (pattern.test(lower)) {
      risk += patternRisk;
    }
  }
  
  return risk;
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
  // Check whitelist by user ID
  if (config.whitelist?.includes(member.id)) {
    return true;
  }
  
  // Check whitelist roles
  if (config.whitelistRoles?.length > 0) {
    for (const roleId of config.whitelistRoles) {
      if (member.roles.cache.has(roleId)) {
        return true;
      }
    }
  }
  
  // Check whitelist channels (if joining from an invite)
  // This would require tracking invite uses
  
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
  const raidConfig = config.raid || {};
  
  const guildJoins = client.joinTracker?.get(guildId) || [];
  const now = Date.now();
  
  // Check joins per second
  const joinsPerSecond = guildJoins.filter(
    j => now - j.timestamp < 1000
  ).length;
  
  if (joinsPerSecond >= raidConfig.maxJoinsPerSecond) {
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
  
  if (recentJoins > raidConfig.maxJoinsPerSecond * 5) {
    return {
      type: 'surge',
      joins: recentJoins,
      timeWindow: '30s'
    };
  }
  
  return null;
}

/**
 * Trigger raid alert
 */
async function triggerRaidAlert(guild, raidInfo, client) {
  const config = defaultConfig;
  const raidConfig = config.raid || {};
  
  console.log(`[AntiRaid] RAID DETECTED in ${guild.name}! Type: ${raidInfo.type}`);
  
  // Enable lockdown
  if (!client.lockdownState) {
    client.lockdownState = new Map();
  }
  
  client.lockdownState.set(guild.id, {
    active: true,
    type: raidInfo.type,
    timestamp: Date.now()
  });
  
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
      console.log(`[AntiRaid] Error locking channel ${channel.name}: ${error.message}`);
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
      { name: 'Action', value: 'Lockdown Enabled', inline: true }
    ))
    .setTimestamp();
  
  // Send to raid log channel
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
}

/**
 * Take action based on risk score
 */
async function takeRiskAction(member, riskScore, config, client) {
  const { riskThresholds, actions } = config;
  
  let action = null;
  
  if (riskScore >= riskThresholds.critical) {
    action = actions.critical;
  } else if (riskScore >= riskThresholds.high) {
    action = actions.high;
  } else if (riskScore >= riskThresholds.medium) {
    action = actions.medium;
  } else if (riskScore >= riskThresholds.low) {
    action = actions.low;
  }
  
  if (!action) return;
  
  console.log(`[AntiRaid] ${member.user.tag} risk score ${riskScore} - Action: ${action}`);
  
  try {
    switch (action) {
      case 'warn':
        // Send warning DM
        const warnEmbed = new EmbedBuilder()
          .setTitle('⚠️ Risk Flag Warning')
          .setColor(0xffaa00)
          .addFields(
            { name: 'Server', value: member.guild.name },
            { name: 'Risk Score', value: String(riskScore) }
          ));
        
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
    }
  } catch (error) {
    console.log(`[AntiRaid] Error taking action: ${error.message}`);
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
        ));
      
      logChannel.send({ embeds: [actionEmbed] }).catch(() => {});
    }
  }
}

// Export for manual trigger
module.exports.triggerRaid = triggerRaidAlert;
module.exports.calculateRiskScore = calculateRiskScore;