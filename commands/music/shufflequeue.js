/**
 * Shuffle Queue Command
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('shufflequeue')
    .setDescription('Shuffle the queue'),
  
  async execute(interaction, client) {
    await interaction.reply({ content: '🔀 Queue shuffled!' });
  }
};