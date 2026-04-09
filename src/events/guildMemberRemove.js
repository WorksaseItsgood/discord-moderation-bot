/**
 * Guild Member Remove Event
 * Handles goodbye messages and logging
 */

import { EmbedBuilder } from 'discord.js';
import { getGuildConfig } from '../database/db.js';
import { logServer } from '../utils/logManager.js';

export default {
  name: 'guildMemberRemove',
  once: false,

  async execute(member, client) {
    const { guild } = member;
    const guildId = guild.id;

    try {
      // Goodbye message
      const config = client.guildConfigs.get(guildId) || {};
      if (config.goodbyeChannel && config.goodbyeMessage) {
        const channel = guild.channels.cache.get(config.goodbyeChannel);
        if (channel) {
          const msg = config.goodbyeMessage
            .replace('{user}', member.user.tag)
            .replace('{server}', guild.name);
          try { await channel.send(msg); } catch {}
        }
      }

      // Log the leave
      try {
        await logServer(guild, 'leave', {
          user: member.user,
          description: `Membre parti: ${member.user.tag}`,
          extra: `A rejoint il y a ${Math.floor((Date.now() - member.joinedTimestamp) / 86400000)} jour(s)`,
        });
      } catch (error) {
        client.logger.error('[guildMemberRemove] Log error:', error);
      }

    } catch (error) {
      client.logger.error('[guildMemberRemove] General error:', error);
    }
  },
};
