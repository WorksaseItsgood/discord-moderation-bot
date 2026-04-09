/**
 * Raid Handler - Enhanced Anti-Raid Protection System
 * With comprehensive action logging and auto-kick functionality
 */

import { EmbedBuilder, ChannelType } from 'discord.js';
import { getGuildConfig, updateGuildConfig, addRaidActionLog } from '../database/db.js';
import { logRaid, logModeration } from '../utils/logManager.js';

let lockedChannels = new Map();
let quarantineRoles = new Map();
let joinTimestamps = new Map();

export function setupRaidHandler(client) {
  client.raidMode = client.raidMode || new Map();
  client.joinTracker = client.joinTracker || new Map();
  client.logger.info('[RaidHandler] Initialized');
}

// Get or create the raid log channel
async function getRaidLogChannel(guild, client) {
  const config = client?.guildConfigs?.get(guild.id) || getGuildConfig(guild.id);
  
  // Try configured channel first
  if (config.raidLogChannel) {
    const channel = guild.channels.cache.get(config.raidLogChannel);
    if (channel) return channel;
  }
  
  // Try finding by name
  const channel = guild.channels.cache.find(c => 
    c.name === 'raid-logs' || c.name === 'anti-raid-logs' || c.name === 'mod-logs'
  );
  return channel;
}

// Log raid action to both console and channel
async function logRaidAction(guild, action, data, client) {
  try {
    // Log to console
    client.logger.info(`[RaidHandler] ${action}:`, data);
    
    // Log to raid-logs channel if available
    const logChannel = await getRaidLogChannel(guild, client);
    if (logChannel) {
      const emojiMap = {
        raidStart: '🚨', raidEnd: '✅', raidAutoKick: '🦶',
        raidQuarantine: '🔒', raidConfig: '⚙️', raidThreshold: '📊',
        raidDerank: '📉', raidUnlock: '🔓', raidLock: '🔒',
        raidAutoEnable: '🤖', joinSpeed: '⚡',
      };
      const emoji = emojiMap[action] || '🛡️';
      
      const embed = new EmbedBuilder()
        .setTitle(`${emoji} Raid Event - ${action}`)
        .setColor(0xff0000)
        .setTimestamp()
        .setFooter({ text: 'Niotic Moderation' });

      if (data.triggeredBy) {
        embed.addFields({ name: '🛡️ Déclencheur', value: data.triggeredBy, inline: true });
      }
      if (data.target) {
        embed.addFields({ name: '👤 Cible', value: `${data.target?.tag || data.target}`, inline: true });
      }
      if (data.reason) {
        embed.addFields({ name: '📝 Raison', value: data.reason, inline: false });
      }
      if (data.threshold) {
        embed.addFields({ name: '📊 Seuil', value: String(data.threshold), inline: true });
      }
      if (data.joinSpeed) {
        embed.addFields({ name: '⚡ Join Speed', value: data.joinSpeed, inline: true });
      }
      if (data.count) {
        embed.addFields({ name: '📌 Count', value: String(data.count), inline: true });
      }
      if (data.duration) {
        embed.addFields({ name: '⏱️ Durée', value: `${data.duration} min`, inline: true });
      }
      if (data.extra) {
        embed.addFields({ name: '📌 Extra', value: String(data.extra), inline: true });
      }

      await logChannel.send({ embeds: [embed] }).catch(() => {});
    }
  } catch (error) {
    client.logger.error('[RaidHandler] Log error:', error);
  }
}

export async function enableRaidMode(guild, triggeredBy, client, type = 'manual') {
  const config = getGuildConfig(guild.id);
  const lockDuration = config.raidLockDuration || 15;
  
  client.raidMode.set(guild.id, {
    active: true,
    type,
    timestamp: Date.now(),
    triggeredBy,
    lockDuration,
  });

  const channels = guild.channels.cache.filter(c => 
    c.type === ChannelType.GuildText || 
    c.type === ChannelType.GuildVoice || 
    c.type === ChannelType.GuildForum
  );
  let count = 0;

  for (const [channelId, channel] of channels) {
    try {
      const perms = channel.permissionOverwrites.cache.get(guild.roles.everyone.id);
      lockedChannels.set(`${guild.id}:${channelId}`, {
        sendMessages: perms?.allow?.has('SendMessages') ?? true,
        connect: perms?.allow?.has('Connect') ?? true,
        addReactions: perms?.allow?.has('AddReactions') ?? true,
        speak: perms?.allow?.has('Speak') ?? true,
      });
      
      await channel.permissionOverwrites.edit(guild.roles.everyone, {
        SendMessages: false,
        AddReactions: false,
        Connect: false,
        Speak: false,
      }, `Raid mode enabled by ${triggeredBy}`);
      count++;
    } catch (error) {
      client.logger.warn(`[RaidHandler] Failed to lock channel ${channelId}:`, error);
    }
  }

  // Log the action
  await logRaidAction(guild, 'raidStart', {
    triggeredBy,
    type,
    count,
    duration: lockDuration,
    reason: 'Raid mode activated',
  }, client);

  // Store lock timestamp for auto-unlock
  client.raidMode.set(`${guild.id}:lockTimestamp`, Date.now());

  return count;
}

export async function disableRaidMode(guild, client) {
  const lockTimestamp = client.raidMode.get(`${guild.id}:lockTimestamp`);
  const lockDuration = client.raidMode.get(guild.id)?.lockDuration || 15;
  
  client.raidMode.set(guild.id, { active: false, timestamp: Date.now() });

  let unlockedCount = 0;
  for (const [channelId, perms] of Object.entries(lockedChannels)) {
    const [gId, cId] = channelId.split(':');
    if (gId !== guild.id) continue;
    const channel = guild.channels.cache.get(cId);
    if (channel) {
      try {
        await channel.permissionOverwrites.edit(guild.roles.everyone, {
          SendMessages: perms.sendMessages ? null : false,
          Connect: perms.connect ? null : false,
          AddReactions: perms.addReactions ? null : false,
          Speak: perms.speak ? null : false,
        });
        unlockedCount++;
      } catch (error) {
        client.logger.warn(`[RaidHandler] Failed to unlock channel ${cId}:`, error);
      }
    }
  }

  // Calculate how long the lock was active
  const lockTime = lockTimestamp ? Math.round((Date.now() - lockTimestamp) / 60000) : 0;

  // Log the action
  await logRaidAction(guild, 'raidEnd', {
    triggeredBy: 'System',
    count: unlockedCount,
    duration: lockTime,
    reason: 'Raid mode deactivated',
  }, client);

  lockedChannels.delete(guild.id);
  client.raidMode.delete(`${guild.id}:lockTimestamp`);
  
  return true;
}

// Check join speed and auto-enable raid mode if threshold exceeded
export async function checkJoinSpeed(guild, member, client) {
  const guildId = guild.id;
  const config = getGuildConfig(guildId);
  
  if (!config.antiRaidEnabled) return { shouldQuarantine: false };
  
  const now = Date.now();
  const windowMs = 10000; // 10 seconds
  const threshold = config.raidThreshold || 5;
  
  // Initialize join tracker for this guild
  if (!client.joinTracker.has(guildId)) {
    client.joinTracker.set(guildId, { recentJoins: [] });
  }
  
  const tracker = client.joinTracker.get(guildId);
  
  // Clean old timestamps (older than 10 seconds)
  tracker.recentJoins = tracker.recentJoins.filter(ts => now - ts < windowMs);
  
  // Add current join
  tracker.recentJoins.push(now);
  
  const joinCount = tracker.recentJoins.length;
  const joinSpeed = `${joinCount} joins in ${windowMs / 1000}s`;
  
  // Log join speed periodically
  if (joinCount === threshold) {
    await logRaidAction(guild, 'joinSpeed', {
      joinSpeed,
      threshold,
      count: joinCount,
      reason: `Join speed threshold reached (${threshold})`,
    }, client);
  }
  
  // Auto-enable raid mode if threshold exceeded
  if (joinCount >= threshold && !client.raidMode.get(guildId)?.active) {
    await enableRaidMode(guild, 'Auto-Trigger', client, 'auto');
    return { shouldQuarantine: true, autoEnabled: true, joinCount };
  }
  
  // If raid mode is active, quarantine new members
  if (client.raidMode.get(guildId)?.active) {
    return { shouldQuarantine: true, autoEnabled: false, joinCount };
  }
  
  return { shouldQuarantine: false, joinCount };
}

// Auto-kick users joining too fast (during raid mode)
export async function autoKickFastJoins(guild, member, client) {
  const guildId = guild.id;
  const config = getGuildConfig(guildId);
  
  if (!config.antiRaidEnabled) return false;
  if (!client.raidMode.get(guildId)?.active) return false;
  
  const now = Date.now();
  const windowMs = 10000;
  const threshold = config.raidThreshold || 5;
  
  if (!client.joinTracker.has(guildId)) return false;
  
  const tracker = client.joinTracker.get(guildId);
  
  // Clean old timestamps
  tracker.recentJoins = tracker.recentJoins.filter(ts => now - ts < windowMs);
  
  const joinCount = tracker.recentJoins.length;
  
  // Kick if joining during high-speed join period
  if (joinCount >= threshold && !member.user.bot) {
    try {
      await member.kick(`Auto-kick: ${joinCount} joins detected in 10s (threshold: ${threshold})`);
      
      await logRaidAction(guild, 'raidAutoKick', {
        triggeredBy: 'Auto-System',
        target: member.user,
        reason: `Fast join detected: ${joinCount} joins in 10s`,
        joinSpeed: `${joinCount} joins in ${windowMs / 1000}s`,
        threshold,
      }, client);
      
      await logModeration(guild, 'kick', {
        target: member.user,
        moderator: { tag: 'Auto-System', id: '0' },
        reason: `Auto-kick: ${joinCount} joins detected in 10s (threshold: ${threshold})`,
      });
      
      return true;
    } catch (error) {
      client.logger.warn(`[RaidHandler] Failed to auto-kick ${member.user.tag}:`, error);
    }
  }
  
  return false;
}

export function getRaidStatus(guildId, client) {
  return client.raidMode?.get(guildId) || { active: false };
}

export async function quarantineUser(member, reason, client) {
  const guild = member.guild;
  let qRole = quarantineRoles.get(guild.id);
  
  if (!qRole) {
    qRole = guild.roles.cache.find(r => r.name === 'Quarantined');
    if (!qRole) {
      try {
        qRole = await guild.roles.create({
          name: 'Quarantined',
          color: 0xff6600,
          reason: 'Auto-created for raid protection',
        });
      } catch (error) {
        client.logger.error('[RaidHandler] Failed to create Quarantined role:', error);
        return false;
      }
    }
    quarantineRoles.set(guild.id, qRole);
  }
  
  try {
    await member.roles.add(qRole, reason || 'Raid mode active');
    
    await logRaidAction(guild, 'raidQuarantine', {
      triggeredBy: 'Auto-System',
      target: member.user,
      reason: reason || 'Raid mode active',
    }, client);
    
    // Try to DM the user
    try {
      await member.send(`⚠️ You have been quarantined in **${guild.name}**: ${reason || 'Raid protection active'}`);
    } catch {}
    
    return true;
  } catch (error) {
    client.logger.warn(`[RaidHandler] Failed to quarantine ${member.user.tag}:`, error);
    return false;
  }
}

// Emergency derank - remove all roles from users
export async function emergencyDerank(guild, triggeredBy, client, excludeBot = true) {
  const members = await guild.members.fetch();
  let deranked = 0;
  const errors = [];
  
  for (const [memberId, member] of members) {
    try {
      // Skip bots if excludeBot is true
      if (excludeBot && member.user.bot) continue;
      
      // Skip the triggered user
      if (member.user.id === triggeredBy.id) continue;
      
      // Skip users with higher roles than the bot
      if (member.roles.highest.position >= guild.me.roles.highest.position) continue;
      
      // Skip users with administrator permission
      if (member.permissions.has('ManageGuild')) continue;
      
      // Remove all roles
      await member.roles.set([], `Emergency derank by ${triggeredBy.tag}`);
      deranked++;
    } catch (error) {
      errors.push(`${member.user.tag}: ${error.message}`);
    }
  }
  
  await logRaidAction(guild, 'raidDerank', {
    triggeredBy: triggeredBy.tag,
    count: deranked,
    reason: 'Emergency derank triggered',
    extra: errors.length > 0 ? `Errors: ${errors.slice(0, 3).join(', ')}` : null,
  }, client);
  
  return { deranked, errors };
}

// Get join statistics
export function getJoinStats(guildId, client) {
  const tracker = client.joinTracker.get(guildId);
  if (!tracker) return { recentJoins: 0, avgJoinSpeed: 0 };
  
  const now = Date.now();
  const recentJoins = tracker.recentJoins.filter(ts => now - ts < 60000).length;
  
  return {
    recentJoins,
    totalTracked: tracker.recentJoins.length,
  };
}

// Export for use in other modules
export default {
  setupRaidHandler,
  enableRaidMode,
  disableRaidMode,
  checkJoinSpeed,
  autoKickFastJoins,
  getRaidStatus,
  quarantineUser,
  emergencyDerank,
  getJoinStats,
};
