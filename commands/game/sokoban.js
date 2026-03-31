/**
 * Sokoban Game Command
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('sokoban')
    .setDescription('Play Sokoban puzzle game'),
  
  async execute(interaction, client) {
    const embed = new EmbedBuilder()
      .setTitle('📦 Sokoban')
      .setDescription('Push all boxes to the marked positions!\n\nUse arrow buttons to move.')
      .setColor(0xffaa00)
      .setFooter({ text: 'Use buttons to push boxes' });
    
    await interaction.reply({ embeds: [embed] });
  }
};