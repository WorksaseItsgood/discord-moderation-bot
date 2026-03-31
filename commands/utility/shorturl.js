/**
 * Short URL Command
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('shorturl')
    .setDescription('Shorten a URL')
    .addStringOption(option => option.setName('url').setDescription('URL to shorten').setRequired(true)),
  
  async execute(interaction, client) {
    const url = interaction.options.getString('url');
    
    await interaction.reply({ content: `🔗 Shortened URL: https://short.url/abc123` });
  }
};