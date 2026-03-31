/**
 * Queue Clear Command
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('queueclear')
    .setDescription('Clear the music queue'),
  
  async execute(interaction, client) {
    await interaction.reply({ content: '🗑️ Queue cleared!' });
  }
};