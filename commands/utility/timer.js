/**
 * Timer Command
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('timer')
    .setDescription('Start a timer')
    .addStringOption(option => option.setName('duration').setDescription('Duration (e.g., 30s, 5m)').setRequired(true)),
  
  async execute(interaction, client) {
    const duration = interaction.options.getString('duration');
    
    await interaction.reply({ content: `⏱️ Timer started for ${duration}!` });
  }
};