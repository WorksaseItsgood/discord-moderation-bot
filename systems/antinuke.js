const { EmbedBuilder } = require('discord.js');
const { defaultConfig } = require('../config');

/**
 * Anti-Nuke System
 * Detects and prevents raid/nuke attempts
 */
module.exports = {
  name: 'guildUpdate',
  once: false,
  async execute(oldGuild, newGuild, client) {
    // Anti-nuke is handled in other events (channelCreate, roleCreate, etc.)
    // This module exports the detection functions
  }
};

// Track actions for rate limiting
const actionTracker = new Map();

/**
 * Check if user is whitelisted
 */
function isWhitelisted(guild, userId, settings) {
  if (!settings) return false;
  
  const whitelistUsers = settings.whitelist_users ? JSON.parse(settings.whitelist_users) : [];
  const whitelistRoles = settings.whitelist_roles ? JSON.parse(settings.whitelist_roles) : [];
  
  if (whitelistUsers.includes(userId)) return true;
  
  const member = guild.members.cache.get(userId);
  if (member) {
    for (const roleId of whitelistRoles) {
      if (member.roles.cache.has(roleId)) return true;
    }
  }
  
  return false;
}

/**
 * Check webhook creation (anti-spam webhooks)
 */
async function checkWebhookCreated(guild, channel, userId, settings) {
  if (!settings || !settings.enabled) return;
  if (isWhitelisted(guild, userId, settings)) return;
  
  const key = `${guild.id}-${userId}-webhook`;
  const count = (actionTracker.get(key) || 0) + 1;
  actionTracker.set(key, count);
  
  // Reset counter after 60 seconds
  setTimeout(() => actionTracker.set(key, Math.max(0, (actionTracker.get(key) || 1) - 1)), 60000);
  
  if (count > settings.webhook_limit) {
    // Too many webhooks, likely a nuke attempt
    await guild.fetch();
    const auditLog = await guild.fetchAuditLogs({ limit: 10, type: 28 }); // type 28 = webhook create
    
    const offender = auditLog.entries.first()?.executor;
    if (offender && !isWhitelisted(guild, offender.id, settings)) {
      await punishUser(guild, offender, 'Webhook spam', 'ban');
    }
  }
}

/**
 * Check channel creation/deletion
 */
async function checkChannelChange(guild, userId, action, settings) {
  if (!settings || !settings.enabled) return;
  if (isWhitelisted(guild, userId, settings)) return;
  
  const key = `${guild.id}-${userId}-channel-${action}`;
  const count = (actionTracker.get(key) || 0) + 1;
  actionTracker.set(key, count);
  
  setTimeout(() => actionTracker.set(key, Math.max(0, (actionTracker.get(key) || 1) - 1)), 60000);
  
  if (count > settings.channel_limit) {
    const auditLog = await guild.fetchAuditLogs({ limit: 10, type: action === 'create' ? 0 : 1 });
    const offender = auditLog.entries.first()?.executor;
    if (offender && !isWhitelisted(guild, offender.id, settings)) {
      await punishUser(guild, offender, 'Channel spam', 'ban');
    }
  }
}

/**
 * Check role creation/deletion
 */
async function checkRoleChange(guild, userId, action, settings) {
  if (!settings || !settings.enabled) return;
  if (isWhitelisted(guild, userId, settings)) return;
  
  const key = `${guild.id}-${userId}-role-${action}`;
  const count = (actionTracker.get(key) || 0) + 1;
  actionTracker.set(key, count);
  
  setTimeout(() => actionTracker.set(key, Math.max(0, (actionTracker.get(key) || 1) - 1)), 60000);
  
  if (count > settings.role_limit) {
    const auditLog = await guild.fetchAuditLogs({ limit: 10, type: action === 'create' ? 30 : 31 });
    const offender = auditLog.entries.first()?.executor;
    if (offender && !isWhitelisted(guild, offender.id, settings)) {
      await punishUser(guild, offender, 'Role spam', 'ban');
    }
  }
}

/**
 * Check ban actions
 */
async function checkBanAction(guild, userId, action, settings) {
  if (!settings || !settings.enabled) return;
  if (isWhitelisted(guild, userId, settings)) return;
  
  const key = `${guild.id}-${userId}-ban`;
  const count = (actionTracker.get(key) || 0) + 1;
  actionTracker.set(key, count);
  
  setTimeout(() => actionTracker.set(key, Math.max(0, (actionTracker.get(key) || 1) - 1)), 60000);
  
  if (count > settings.ban_threshold) {
    await punishUser(guild, userId, 'Mass ban', 'ban');
  }
}

/**
 * Check kick actions
 */
async function checkKickAction(guild, userId, action, settings) {
  if (!settings || !settings.enabled) return;
  if (isWhitelisted(guild, userId, settings)) return;
  
  const key = `${guild.id}-${userId}-kick`;
  const count = (actionTracker.get(key) || 0) + 1;
  actionTracker.set(key, count);
  
  setTimeout(() => actionTracker.set(key, Math.max(0, (actionTracker.get(key) || 1) - 1)), 60000);
  
  if (count > settings.kick_threshold) {
    await punishUser(guild, userId, 'Mass kick', 'kick');
  }
}

/**
 * Punish user for nuking
 */
async function punishUser(guild, user, reason, action) {
  console.log(`[AntiNuke] Punishing ${user.tag} for ${reason}`);
  
  try {
    const member = guild.members.cache.get(user.id);
    if (!member) return;
    
    switch (action) {
      case 'ban':
        await member.ban({ reason: `[Anti-Nuke] ${reason}` });
        break;
      case 'kick':
        await member.kick(`[Anti-Nuke] ${reason}`);
        break;
      case 'mute':
        await member.timeout(86400000 * 7, `[Anti-Nuke] ${reason}`); // 7 days
        break;
    }
    
    // Notify in mod log
    const logChannel = guild.channels.cache.find(ch => 
      ch.name === 'mod-logs' || ch.name === 'admin-logs'
    );
    
    if (logChannel) {
      const embed = new EmbedBuilder()
        .setTitle('🛡️ Anti-Nuke Action')
        .setColor(0xff0000)
        .addFields(
          { name: 'User', value: `${user} (${user.id})`, inline: true },
          { name: 'Action', value: action, inline: true },
          { name: 'Reason', value: reason, inline: true }
        ));
      
      await logChannel.send({ embeds: [embed] });
    }
  } catch (error) {
    console.error(`[AntiNuke] Error punishing user:`, error.message);
  }
}

module.exports = {
  checkWebhookCreated,
  checkChannelChange,
  checkRoleChange,
  checkBanAction,
  checkKickAction,
  isWhitelisted
};