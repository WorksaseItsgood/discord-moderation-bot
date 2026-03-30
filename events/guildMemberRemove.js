const { EmbedBuilder } = require('discord.js');
const { defaultConfig } = require('../config');

/**
 * Guild Member Remove Event
 * Logs member departures (handled in systems/logger.js as well)
 */
module.exports = {
  name: 'guildMemberRemove',
  once: false,
  async execute(member, client) {
    // Additional handling can be added here if needed
    // Main logging is handled in systems/logger.js
  }
};