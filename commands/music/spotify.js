/**
 * Spotify Link Command
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('spotify')
    .setDescription('Play from Spotify')
    .addStringOption(option => option.setName('query').setDescription('Search query or URL').setRequired(true)),
  
  async execute(interaction, client) {
    const query = interaction.options.getString('query');
    
    await interaction.reply({ content: `🎵 Searching Spotify for: **${query}**` });
  }
};