/**
 * Guild Audit Log Entry Event
 * Tracks channel creates/deletes, bans/kicks via audit log
 */

import { Events, AuditLogEvent } from 'discord.js';
import { checkRaidAction, recordRaidAction } from '../handlers/raidDetector.js';
import { getRaidConfig } from '../database/db.js';
import { autoDerankUser } from '../handlers/raidHandler.js';
import { logRaidAction } from '../utils/logManager.js';

export default {
  name: Events.GuildAuditLogEntryCreate,
  once: false,

  async execute(auditLogEntry, guild, client) {
    try {
      const actionType = auditLogEntry.action;
      const executorId = auditLogEntry.executorId;
      const targetId = auditLogEntry.targetId;
      const guildId = guild.id;

      // Get raid config
      const config = getRaidConfig(guildId);
      if (!config || !config.autoDerankEnabled) return;

      // Check if executor is whitelisted
      if (config.whitelistBypass?.includes(executorId) || config.raidWhitelist?.includes(executorId)) {
        return;
      }

      // Handle different audit log events
      switch (actionType) {
        case AuditLogEvent.ChannelCreate:
          await handleChannelCreate(auditLogEntry, guild, config, client);
          break;
        case AuditLogEvent.ChannelDelete:
          await handleChannelDelete(auditLogEntry, guild, config, client);
          break;
        case AuditLogEvent.MemberBan:
          await handleMemberBan(auditLogEntry, guild, config, client);
          break;
        case AuditLogEvent.MemberKick:
          await handleMemberKick(auditLogEntry, guild, config, client);
          break;
        case AuditLogEvent.RoleCreate:
          await handleRoleCreate(auditLogEntry, guild, config, client);
          break;
        case AuditLogEvent.RoleDelete:
          await handleRoleDelete(auditLogEntry, guild, config, client);
          break;
      }
    } catch (error) {
      // Silently handle errors to avoid spam
    }
  },
};

/**
 * Handle channel creation via audit log
 */
async function handleChannelCreate(auditLogEntry, guild, config, client) {
  const executorId = auditLogEntry.executorId;
  const guildId = guild.id;

  // Record the action
  recordRaidAction(guildId, executorId, 'channel_create', 1);

  // Check if threshold exceeded
  const result = checkRaidAction(
    guildId,
    executorId,
    'channel_create',
    config.raidChannelThreshold || config.channelCreateThreshold || 5,
    config.raidChannelWindow || config.channelCreateWindowMinutes * 60 || 120
  );

  if (result.detected) {
    const member = await guild.members.fetch(executorId).catch(() => null);
    if (member && !member.permissions.has('Administrator')) {
      // Derank the user
      await autoDerankUser(guild, member, `Channel creation spam: ${result.count} channels created`, client);
      
      await logRaidAction(guild, executorId, 'channelCreate', {
        target: member.user,
        reason: `Channel creation spam: ${result.count} channels created`,
        count: result.count,
        threshold: result.threshold,
      });
    }
  }
}

/**
 * Handle channel deletion via audit log
 */
async function handleChannelDelete(auditLogEntry, guild, config, client) {
  const executorId = auditLogEntry.executorId;
  const guildId = guild.id;

  // Record the action
  recordRaidAction(guildId, executorId, 'channel_delete', 1);

  // Check if threshold exceeded
  const result = checkRaidAction(
    guildId,
    executorId,
    'channel_delete',
    config.raidDeleteThreshold || config.channelDeleteThreshold || 5,
    config.raidDeleteWindow || config.channelDeleteWindowMinutes * 60 || 120
  );

  if (result.detected) {
    const member = await guild.members.fetch(executorId).catch(() => null);
    if (member && !member.permissions.has('Administrator')) {
      // Derank the user
      await autoDerankUser(guild, member, `Channel deletion spam: ${result.count} channels deleted`, client);
      
      await logRaidAction(guild, executorId, 'channelDelete', {
        target: member.user,
        reason: `Channel deletion spam: ${result.count} channels deleted`,
        count: result.count,
        threshold: result.threshold,
      });
    }
  }
}

/**
 * Handle member ban via audit log
 */
async function handleMemberBan(auditLogEntry, guild, config, client) {
  const executorId = auditLogEntry.executorId;
  const guildId = guild.id;

  // Record the action
  recordRaidAction(guildId, executorId, 'ban', 1);

  // Check if threshold exceeded
  const result = checkRaidAction(
    guildId,
    executorId,
    'ban',
    config.raidBanThreshold || config.massBanThreshold || 10,
    config.raidBanWindow || config.massBanWindowMinutes * 60 || 300
  );

  if (result.detected) {
    const member = await guild.members.fetch(executorId).catch(() => null);
    if (member && !member.permissions.has('Administrator')) {
      // Derank the user
      await autoDerankUser(guild, member, `Mass ban detected: ${result.count} bans`, client);
      
      await logRaidAction(guild, executorId, 'ban', {
        target: member.user,
        reason: `Mass ban detected: ${result.count} bans`,
        count: result.count,
        threshold: result.threshold,
      });
    }
  }
}

/**
 * Handle member kick via audit log
 */
async function handleMemberKick(auditLogEntry, guild, config, client) {
  const executorId = auditLogEntry.executorId;
  const guildId = guild.id;

  // Record the action
  recordRaidAction(guildId, executorId, 'kick', 1);

  // Check if threshold exceeded
  const result = checkRaidAction(
    guildId,
    executorId,
    'kick',
    config.raidKickThreshold || config.massKickThreshold || 15,
    config.raidKickWindow || config.massKickWindowMinutes * 60 || 300
  );

  if (result.detected) {
    const member = await guild.members.fetch(executorId).catch(() => null);
    if (member && !member.permissions.has('Administrator')) {
      // Derank the user
      await autoDerankUser(guild, member, `Mass kick detected: ${result.count} kicks`, client);
      
      await logRaidAction(guild, executorId, 'kick', {
        target: member.user,
        reason: `Mass kick detected: ${result.count} kicks`,
        count: result.count,
        threshold: result.threshold,
      });
    }
  }
}

/**
 * Handle role creation via audit log
 */
async function handleRoleCreate(auditLogEntry, guild, config, client) {
  const executorId = auditLogEntry.executorId;
  const guildId = guild.id;

  // Record the action
  recordRaidAction(guildId, executorId, 'role_create', 1);

  // Check if threshold exceeded (higher threshold for roles)
  const result = checkRaidAction(
    guildId,
    executorId,
    'role_create',
    20, // Higher threshold for role creation
    60
  );

  if (result.detected) {
    const member = await guild.members.fetch(executorId).catch(() => null);
    if (member && !member.permissions.has('Administrator')) {
      // Derank the user
      await autoDerankUser(guild, member, `Mass role creation: ${result.count} roles created`, client);
      
      await logRaidAction(guild, executorId, 'roleCreate', {
        target: member.user,
        reason: `Mass role creation: ${result.count} roles created`,
        count: result.count,
        threshold: result.threshold,
      });
    }
  }
}

/**
 * Handle role deletion via audit log
 */
async function handleRoleDelete(auditLogEntry, guild, config, client) {
  const executorId = auditLogEntry.executorId;
  const guildId = guild.id;

  // Record the action
  recordRaidAction(guildId, executorId, 'role_delete', 1);

  // Check if threshold exceeded
  const result = checkRaidAction(
    guildId,
    executorId,
    'role_delete',
    20,
    60
  );

  if (result.detected) {
    const member = await guild.members.fetch(executorId).catch(() => null);
    if (member && !member.permissions.has('Administrator')) {
      // Derank the user
      await autoDerankUser(guild, member, `Mass role deletion: ${result.count} roles deleted`, client);
      
      await logRaidAction(guild, executorId, 'roleDelete', {
        target: member.user,
        reason: `Mass role deletion: ${result.count} roles deleted`,
        count: result.count,
        threshold: result.threshold,
      });
    }
  }
}
