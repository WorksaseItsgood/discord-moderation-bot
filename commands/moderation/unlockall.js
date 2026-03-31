/**
 * Unlock All Command
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('unlockall')
    .setDescription('Unlock all channels'),
  
  async execute(interaction, client) {
    await interaction.reply({ content: '🔓 Unlocking all channels!' });
  }
};