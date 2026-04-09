import { onChannelCreate } from '../handlers/raidDetection.js';

export default {
  name: 'channelCreate',
  once: false,

  async execute(channel, client) {
    await onChannelCreate(channel, client);
  },
};
