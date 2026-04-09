import { onGuildMemberRemove } from '../handlers/raidDetection.js';

export default {
  name: 'guildMemberRemove',
  once: false,

  async execute(member, client) {
    await onGuildMemberRemove(member, client);
  },
};
