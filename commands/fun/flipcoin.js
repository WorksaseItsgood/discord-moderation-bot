/**
 * Flipcoin Command - Flip a coin
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('flipcoin')
    .setDescription('Flip a coin'),
  
  async execute(interaction, client) {
    const result = Math.random() < 0.5 ? 'Heads' : 'Tails';
    const emoji = result === 'Heads' ? '🪙' : '📀';
    
    const embed = new EmbedBuilder()
      .setTitle('🪙 Coin Flip')
      .setDescription(`${emoji} **${result}**`)
      .setColor(0xffd700);
    
    await interaction.reply({ embeds: [embed] });
  }
};