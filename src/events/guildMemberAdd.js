import { EmbedBuilder } from 'discord.js';

export default {
  name: 'guildMemberAdd',
  once: false,

  async execute(member, client) {
    const { guild, user } = member;
    const guildId = guild.id;

    // Check whitelist
    try {
      const { getWhitelist } = await import('../database/db.js');
      const whitelist = await getWhitelist(guildId);
      if (whitelist.users?.includes(member.id)) return;
      if (member.roles?.cache.some(r => whitelist.roles?.includes(r.id))) return;
    } catch {}

    // Auto-role
    const config = client.guildConfigs.get(guildId) || {};
    if (config.autoRole) {
      try {
        await member.roles.add(config.autoRole).catch(() => {});
      } catch {}
    }

    // Raid mode quarantine
    const raidState = client.raidMode?.get(guildId);
    if (raidState?.active) {
      // Quarantine new member during raid
      let qRole = guild.roles.cache.find(r => r.name === 'Quarantined');
      if (!qRole) {
        qRole = await guild.roles.create({ name: 'Quarantined', color: 0xff6600 });
      }
      await member.roles.add(qRole, 'Raid mode active').catch(() => {});
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
  },
};
