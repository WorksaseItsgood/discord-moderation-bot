/**
 * Lock All Command
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('lockall')
    .setDescription('Lock all channels'),
  
  async execute(interaction, client) {
    await interaction.reply({ content: '🔒 Locking all channels!' });
  }
};