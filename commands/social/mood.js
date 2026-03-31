/**
 * Mood Command
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('mood')
    .setDescription('Set your mood')
    .addStringOption(option => option.setName('mood').setDescription('Mood')
      .addChoices(
        { name: 'Happy', value: 'happy' },
        { name: 'Sad', value: 'sad' },
        { name: 'Excited', value: 'excited' },
        { name: 'Tired', value: 'tired' }
      ).setRequired(false)),
  
  async execute(interaction, client) {
    const mood = interaction.options.getString('mood') || 'happy';
    
    await interaction.reply({ content: `😀 Mood set to: ${mood}` });
  }
};