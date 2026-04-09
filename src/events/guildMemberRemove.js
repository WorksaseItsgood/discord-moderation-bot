import { EmbedBuilder } from 'discord.js';

export default {
  name: 'guildMemberRemove',
  once: false,

  async execute(member, client) {
    const { guild } = member;
    const guildId = guild.id;

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
  },
};
