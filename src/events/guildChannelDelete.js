import { onChannelDelete } from '../handlers/raidDetection.js';

export default {
  name: 'channelDelete',
  once: false,

  async execute(channel, client) {
    await onChannelDelete(channel, client);
  },
};
