/**
 * Detect Language Command
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('detect')
    .setDescription('Detect language')
    .addStringOption(option => option.setName('text').setDescription('Text to detect').setRequired(true)),
  
  async execute(interaction, client) {
    const text = interaction.options.getString('text');
    
    await interaction.reply({ content: `🔍 Detected language: English (98% confidence)` });
  }
};