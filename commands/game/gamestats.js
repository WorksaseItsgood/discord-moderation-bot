/**
 * Game Stats Command
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('gamestats')
    .setDescription('View your game statistics'),
  
  async execute(interaction, client) {
    const embed = new EmbedBuilder()
      .setTitle('🎮 Game Stats')
      .setDescription(`Stats for ${interaction.user.username}`)
      .addFields(
        { name: 'Total Games Played', value: '42', inline: true },
        { name: 'Wins', value: '18', inline: true },
        { name: 'Losses', value: '24', inline: true },
        { name: 'Win Rate', value: '42.8%', inline: true },
        { name: 'Favorite Game', value: 'Blackjack', inline: true },
        { name: 'Best Score', value: '2,450', inline: true }
      )
      .setColor(0x00ff00);
    
    await interaction.reply({ embeds: [embed] });
  }
};