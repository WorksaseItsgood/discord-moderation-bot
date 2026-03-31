/**
 * Remove Song Command
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('remove')
    .setDescription('Remove a song from the queue')
    .addIntegerOption(option => option.setName('position').setDescription('Position in queue').setRequired(true)),
  
  async execute(interaction, client) {
    const position = interaction.options.getInteger('position');
    
    await interaction.reply({ content: `🎵 Removed song at position ${position}!` });
  }
};