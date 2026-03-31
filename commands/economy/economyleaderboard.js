/**
 * Economy Leaderboard Global Command
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('economyleaderboard')
    .setDescription('View economy leaderboard')
    .addStringOption(option => option.setName('type').setDescription('Leaderboard type')
      .addChoices(
        { name: 'Global', value: 'global' },
        { name: 'Weekly', value: 'weekly' },
        { name: 'Monthly', value: 'monthly' }
      ).setRequired(false)),
  
  async execute(interaction, client) {
    const type = interaction.options.getString('type') || 'global';
    
    const embed = new EmbedBuilder()
      .setTitle(`💰 ${type.charAt(0).toUpperCase() + type.slice(1)} Economy Leaderboard`)
      .setDescription('Top richest users:')
      .addFields(
        { name: '🥇 User1', value: '100,000 coins', inline: false },
        { name: '🥈 User2', value: '75,000 coins', inline: false },
        { name: '🥉 User3', value: '50,000 coins', inline: false },
        { name: '4. User4', value: '25,000 coins', inline: false },
        { name: '5. User5', value: '10,000 coins', inline: false }
      )
      .setColor(0xffd700);
    
    await interaction.reply({ embeds: [embed] });
  }
};