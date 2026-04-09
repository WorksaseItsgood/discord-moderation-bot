/**
 * Guild Member Add Event
 * Handles auto-role, raid protection, and welcome messages
 */

import { EmbedBuilder } from 'discord.js';
import { getGuildConfig, getWhitelist } from '../database/db.js';
import { checkJoinSpeed, autoKickFastJoins, quarantineUser } from '../handlers/raidHandler.js';
import { logServer } from '../utils/logManager.js';

export default {
  name: 'guildMemberAdd',
  once: false,

  async execute(member, client) {
    const { guild, user } = member;
    const guildId = guild.id;

    try {
      // Check whitelist
      try {
        const whitelist = await getWhitelist(guildId);
        if (whitelist.users?.includes(member.id)) return;
        if (member.roles?.cache.some(r => whitelist.roles?.includes(r.id))) return;
      } catch {}

      // Check join speed and raid protection
      try {
        const raidCheck = await checkJoinSpeed(guild, member, client);
        
        if (raidCheck.shouldQuarantine) {
          await quarantineUser(member, 'Raid mode active - Auto quarantine', client);
        }
        
        // Auto-kick fast joins during raid mode
        if (raidCheck.autoEnabled) {
          // Already logged in checkJoinSpeed
        }
      } catch (error) {
        client.logger.error('[guildMemberAdd] Raid check error:', error);
      }

      // Auto-role
      const config = client.guildConfigs.get(guildId) || {};
      if (config.autoRole) {
        try {
          await member.roles.add(config.autoRole).catch(() => {});
        } catch {}
      }

      // Welcome message
      if (config.welcomeChannel && config.welcomeMessage) {
        const channel = guild.channels.cache.get(config.welcomeChannel);
        if (channel) {
          const msg = config.welcomeMessage
            .replace('{user}', member.toString())
            .replace('{server}', guild.name);
          try { await channel.send(msg); } catch {}
        }
      }

      // Log the join
      try {
        await logServer(guild, 'join', {
          user: member.user,
          description: `Nouveau membre: ${member.user.tag}`,
          extra: `Compte créé il y a ${Math.floor((Date.now() - member.user.createdTimestamp) / 86400000)} jour(s)`,
        });
      } catch (error) {
        client.logger.error('[guildMemberAdd] Log error:', error);
      }

    } catch (error) {
      client.logger.error('[guildMemberAdd] General error:', error);
    }
  },
};
