const { EmbedBuilder } = require('discord.js');
const { defaultConfig } = require('../config');

/**
 * Voice State Update Event
 * Handles voice join/leave/mute/deafen
 */
module.exports = {
  name: 'voiceStateUpdate',
  once: false,
  async execute(oldState, newState, client) {
    const config = defaultConfig;
    const guild = newState.guild;
    
    // Voice logging is handled in systems/logger.js
    // This event is also used by anti-raid for checking suspicious voice activity
    
    // Check for voice raid patterns (optional)
    // Could add voice-only raid detection here if needed
  }
};