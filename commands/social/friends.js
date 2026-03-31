/**
 * Friends Command
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('friends')
    .setDescription('View your friends list'),
  
  async execute(interaction, client) {
    await interaction.reply({ content: '👥 Your friends: Coming soon!' });
  }
};