/**
 * Divorce Command
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('divorce')
    .setDescription('File for divorce'),
  
  async execute(interaction, client) {
    await interaction.reply({ content: '💔 Divorce filed...' });
  }
};