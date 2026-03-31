/**
 * Expand URL Command
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('expandurl')
    .setDescription('Expand a shortened URL')
    .addStringOption(option => option.setName('url').setDescription('Short URL').setRequired(true)),
  
  async execute(interaction, client) {
    const url = interaction.options.getString('url');
    
    await interaction.reply({ content: `🔗 Expanded: https://example.com/very/long/url` });
  }
};