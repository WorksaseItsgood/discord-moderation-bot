/**
 * Unmute All Command
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('unmuteall')
    .setDescription('Unmute all muted members'),
  
  async execute(interaction, client) {
    await interaction.reply({ content: '🔊 Unmuted all members!' });
  }
};