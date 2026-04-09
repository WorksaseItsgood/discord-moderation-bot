import { getGuildConfig } from '../database/db.js';

export default {
  name: 'guildCreate',
  once: false,

  async execute(guild, client) {
    console.log(`[Guild] Joined: ${guild.name} (${guild.id})`);
    try {
      const config = getGuildConfig(guild.id);
      client.guildConfigs.set(guild.id, config);
    } catch (err) {
      console.error('[GuildCreate Error]', err.message);
    }
  },
};
