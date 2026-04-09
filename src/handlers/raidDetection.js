/**
 * Raid Detection Handler - Real-time anti-raid protection
 * Tracks suspicious actions and auto-deranks users when thresholds are exceeded
 */

import { getRaidConfig, updateRaidConfig, trackRaidAction, getRaidActionCount, clearRaidActions, addRaidActionLog } from '../database/db.js';
import { autoDerankUser } from './raidHandler.js';
import { logRaid, logDerank } from '../utils/logManager.js';

export async function onChannelCreate(channel, client) {
  try {
    const guild = channel.guild;
    const guildId = guild.id;
    const config = getRaidConfig(guildId);
    
    if (!config.autoDerankEnabled) return;
    
    // Check whitelist bypass
    if (config.whitelistBypass?.length > 0) return;
    
    const actionType = 'channel_create';
    const windowSeconds = config.raidChannelWindow || config.channelCreateWindowMinutes * 60;
    const threshold = config.raidChannelThreshold || config.channelCreateThreshold;
    
    trackRaidAction(guildId, 'global', actionType);
    const count = getRaidActionCount(guildId, 'global', actionType, windowSeconds);
    
    if (count >= threshold) {
      await logRaid(guild, 'raidChannelCreate', {
        reason: `Channel creation threshold exceeded: ${count} channels in ${windowSeconds / 60} min`,
        threshold,
        count,
      });
      
      // Find users who created many channels recently and derank them
      // This is a simplified approach - in production you'd track per-user
      await addRaidActionLog(guildId, {
        type: 'channel_create_threshold',
        triggeredBy: 'Auto-System',
        reason: `Threshold exceeded: ${count} channels created`,
        count,
        threshold,
      });
    }
  } catch (error) {
    console.error('[RaidDetection] onChannelCreate error:', error);
  }
}

export async function onChannelDelete(channel, client) {
  try {
    const guild = channel.guild;
    const guildId = guild.id;
    const config = getRaidConfig(guildId);
    
    if (!config.autoDerankEnabled) return;
    if (config.whitelistBypass?.length > 0) return;
    
    const actionType = 'channel_delete';
    const windowSeconds = config.raidDeleteWindow || config.channelDeleteWindowMinutes * 60;
    const threshold = config.raidDeleteThreshold || config.channelDeleteThreshold;
    
    trackRaidAction(guildId, 'global', actionType);
    const count = getRaidActionCount(guildId, 'global', actionType, windowSeconds);
    
    if (count >= threshold) {
      await logRaid(guild, 'raidChannelDelete', {
        reason: `Channel delete threshold exceeded: ${count} channels in ${windowSeconds / 60} min`,
        threshold,
        count,
      });
      
      await addRaidActionLog(guildId, {
        type: 'channel_delete_threshold',
        triggeredBy: 'Auto-System',
        reason: `Threshold exceeded: ${count} channels deleted`,
        count,
        threshold,
      });
    }
  } catch (error) {
    console.error('[RaidDetection] onChannelDelete error:', error);
  }
}

export async function onGuildBanAdd(ban, client) {
  try {
    const guild = ban.guild;
    const guildId = guild.id;
    const config = getRaidConfig(guildId);
    const user = ban.user;
    
    if (!config.autoDerankEnabled) return;
    
    // Check if user is whitelisted
    if (config.whitelistBypass?.includes(user.id)) return;
    if (config.raidWhitelist?.includes(user.id)) return;
    
    const actionType = 'mass_ban';
    const windowSeconds = config.raidBanWindow || config.massBanWindowMinutes * 60;
    const threshold = config.raidBanThreshold || config.massBanThreshold;
    
    trackRaidAction(guildId, user.id, actionType);
    const count = getRaidActionCount(guildId, user.id, actionType, windowSeconds);
    
    if (count >= threshold) {
      await logRaid(guild, 'raidMassBan', {
        target: user,
        reason: `Mass ban threshold exceeded: ${count} bans by ${user.tag}`,
        threshold,
        count,
      });
      
      // Get the member and derank them
      const member = await guild.members.fetch(user.id).catch(() => null);
      if (member) {
        await autoDerankUser(guild, member, `Mass ban detected: ${count} bans in ${windowSeconds / 60} minutes`, client);
      }
      
      await addRaidActionLog(guildId, {
        type: 'mass_ban_threshold',
        triggeredBy: user.tag,
        targetId: user.id,
        reason: `Mass ban threshold exceeded: ${count} bans`,
        count,
        threshold,
      });
    }
  } catch (error) {
    console.error('[RaidDetection] onGuildBanAdd error:', error);
  }
}

export async function onGuildMemberRemove(member, client) {
  try {
    const guild = member.guild;
    const guildId = guild.id;
    const config = getRaidConfig(guildId);
    
    if (!config.autoDerankEnabled) return;
    
    const actionType = 'mass_kick';
    const windowSeconds = config.raidKickWindow || config.massKickWindowMinutes * 60;
    const threshold = config.raidKickThreshold || config.massKickThreshold;
    
    trackRaidAction(guildId, member.user.id, actionType);
    const count = getRaidActionCount(guildId, member.user.id, actionType, windowSeconds);
    
    if (count >= threshold) {
      await logRaid(guild, 'raidMassKick', {
        target: member.user,
        reason: `Mass kick detected: ${count} kicks by ${member.user.tag}`,
        threshold,
        count,
      });
      
      await addRaidActionLog(guildId, {
        type: 'mass_kick_threshold',
        triggeredBy: member.user.tag,
        targetId: member.user.id,
        reason: `Mass kick threshold exceeded: ${count} kicks`,
        count,
        threshold,
      });
    }
  } catch (error) {
    console.error('[RaidDetection] onGuildMemberRemove error:', error);
  }
}

export async function onMessageCreate(message, client) {
  try {
    if (message.author.bot) return;
    if (!message.guild) return;
    
    const guild = message.guild;
    const guildId = guild.id;
    const config = getRaidConfig(guildId);
    
    if (!config.autoDerankEnabled) return;
    
    // Check if user is whitelisted
    if (config.whitelistBypass?.includes(message.author.id)) return;
    if (config.raidWhitelist?.includes(message.author.id)) return;
    
    const actionType = 'spam';
    const windowSeconds = config.raidSpamWindow || config.spamWindowSeconds;
    const threshold = config.raidSpamThreshold || config.spamThreshold;
    
    trackRaidAction(guildId, message.author.id, actionType);
    const count = getRaidActionCount(guildId, message.author.id, actionType, windowSeconds);
    
    if (count >= threshold) {
      await logRaid(guild, 'raidSpam', {
        target: message.author,
        reason: `Spam detected: ${count} messages in ${windowSeconds} seconds`,
        threshold,
        count,
      });
      
      const member = await guild.members.fetch(message.author.id).catch(() => null);
      if (member) {
        await autoDerankUser(guild, member, `Spam detected: ${count} messages in ${windowSeconds} seconds`, client);
      }
      
      // Clear the user's raid actions after deranking
      clearRaidActions(guildId, message.author.id);
      
      await addRaidActionLog(guildId, {
        type: 'spam_threshold',
        triggeredBy: message.author.tag,
        targetId: message.author.id,
        reason: `Spam threshold exceeded: ${count} messages`,
        count,
        threshold,
      });
    }
  } catch (error) {
    console.error('[RaidDetection] onMessageCreate error:', error);
  }
}

export default {
  onChannelCreate,
  onChannelDelete,
  onGuildBanAdd,
  onGuildMemberRemove,
  onMessageCreate,
};
