/**
 * Banwave Command
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('banwave')
    .setDescription('Start a banwave')
    .addStringOption(option => option.setName('reason').setDescription('Reason for banwave').setRequired(false)),
  
  async execute(interaction, client) {
    const reason = interaction.options.getString('reason') || 'Banwave initiated';
    
    await interaction.reply({ content: `⚠️ Starting banwave: ${reason}` });
  }
};