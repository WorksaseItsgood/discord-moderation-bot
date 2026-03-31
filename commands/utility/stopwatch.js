/**
 * Stopwatch Command
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('stopwatch')
    .setDescription('Start a stopwatch'),
  
  async execute(interaction, client) {
    await interaction.reply({ content: '⏱️ Stopwatch started! Use /stopwatch stop to stop it.' });
  }
};