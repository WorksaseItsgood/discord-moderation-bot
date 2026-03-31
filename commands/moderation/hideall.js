/**
 * Hide All Command
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('hideall')
    .setDescription('Hide all channels from everyone'),
  
  async execute(interaction, client) {
    await interaction.reply({ content: '👀 Hiding all channels!' });
  }
};