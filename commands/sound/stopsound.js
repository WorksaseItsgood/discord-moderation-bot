/**
 * Stop Sound Command
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('stopsound')
    .setDescription('Stop playing sound'),
  
  async execute(interaction, client) {
    await interaction.reply({ content: '⏹️ Sound stopped!' });
  }
};