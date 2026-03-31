/**
 * Leaderboard Game Command
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('gameleaders')
    .setDescription('View game leaderboards')
    .addStringOption(option => option.setName('game').setDescription('Specific game')
      .addChoices(
        { name: 'Blackjack', value: 'blackjack' },
        { name: 'Slots', value: 'slots' },
        { name: 'Roulette', value: 'roulette' },
        { name: 'Overall', value: 'overall' }
      ).setRequired(false)),
  
  async execute(interaction, client) {
    const game = interaction.options.getString('game') || 'overall';
    
    const embed = new EmbedBuilder()
      .setTitle(`🏆 ${game.charAt(0).toUpperCase() + game.slice(1)} Leaderboard`)
      .setDescription('Top players in wins!')
      .addFields(
        { name: '1. 🥇 User1', value: '245 wins', inline: false },
        { name: '2. 🥈 User2', value: '189 wins', inline: false },
        { name: '3. 🥉 User3', value: '156 wins', inline: false },
        { name: '4. User4', value: '134 wins', inline: false },
        { name: '5. User5', value: '98 wins', inline: false }
      )
      .setColor(0xffd700);
    
    await interaction.reply({ embeds: [embed] });
  }
};