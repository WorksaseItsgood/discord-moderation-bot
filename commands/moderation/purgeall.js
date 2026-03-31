/**
 * Purge All Command
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('purgeall')
    .setDescription('Purge messages from all channels'),
  
  async execute(interaction, client) {
    await interaction.reply({ content: '🗑️ Purging messages from all channels...' });
  }
};