/**
 * TTS Command - Text to speech
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('tts')
    .setDescription('Convert text to speech')
    .addStringOption(option => option.setName('text').setDescription('Text to speak').setRequired(true)),
  
  async execute(interaction, client) {
    const text = interaction.options.getString('text');
    
    await interaction.reply({ content: `🗣️ Speaking: ${text}` });
  }
};