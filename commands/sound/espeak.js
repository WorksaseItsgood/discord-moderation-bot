/**
 * Espeak Command
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('espeak')
    .setDescription('Use espeak for TTS')
    .addStringOption(option => option.setName('text').setDescription('Text to speak').setRequired(true)),
  
  async execute(interaction, client) {
    const text = interaction.options.getString('text');
    
    await interaction.reply({ content: `🔊 Espeak: ${text}` });
  }
};