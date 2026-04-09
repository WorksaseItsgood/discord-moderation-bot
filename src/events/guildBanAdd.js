import { onGuildBanAdd } from '../handlers/raidDetection.js';

export default {
  name: 'guildBanAdd',
  once: false,

  async execute(ban, client) {
    await onGuildBanAdd(ban, client);
  },
};
