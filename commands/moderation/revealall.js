/**
 * Reveal All Command
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('revealall')
    .setDescription('Reveal all hidden channels'),
  
  async execute(interaction, client) {
    await interaction.reply({ content: '👁️ Revealing all channels!' });
  }
};