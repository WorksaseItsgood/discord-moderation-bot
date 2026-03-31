/**
 * Splash Command - Get server splash screen
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('splash')
    .setDescription('Get server splash screen'),
  
  async execute(interaction, client) {
    await interaction.reply({ content: '📸 Server splash background' });
  }
};