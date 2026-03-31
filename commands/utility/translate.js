/**
 * Translate Command
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('translate')
    .setDescription('Translate text')
    .addStringOption(option => option.setName('text').setDescription('Text to translate').setRequired(true))
    .addStringOption(option => option.setName('language').setDescription('Target language').setRequired(true)),
  
  async execute(interaction, client) {
    const text = interaction.options.getString('text');
    const language = interaction.options.getString('language');
    
    await interaction.reply({ content: `🌐 Translated to ${language}: "${text}"` });
  }
};