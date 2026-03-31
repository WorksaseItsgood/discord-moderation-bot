/**
 * Tetris Game Command
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('tetris')
    .setDescription('Play a game of Tetris'),
  
  async execute(interaction, client) {
    const embed = new EmbedBuilder()
      .setTitle('🧱 Tetris')
      .setDescription('Classic block-stacking game!\n\nUse buttons to control the pieces.')
      .setColor(0x0000ff)
      .setFooter({ text: 'Use buttons to play' });
    
    await interaction.reply({ embeds: [embed] });
  }
};