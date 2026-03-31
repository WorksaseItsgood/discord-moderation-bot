/**
 * PUBG Stats Command
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('pubg')
    .setDescription('Get PUBG player stats')
    .addStringOption(option => option.setName('username').setDescription('PUBG username').setRequired(true))
    .addStringOption(option => option.setName('region').setDescription('Region').addChoices(
      { name: 'NA', value: 'na' },
      { name: 'EU', value: 'eu' },
      { name: 'AS', value: 'as' },
      { name: 'KR', value: 'kr' }
    ).setRequired(false)),
  
  async execute(interaction, client) {
    const username = interaction.options.getString('username');
    const region = interaction.options.getString('region') || 'na';
    
    const embed = new EmbedBuilder()
      .setTitle('🎮 PUBG Stats')
      .setDescription(`Stats for **${username}** (${region.toUpperCase()})`)
      .addFields(
        { name: 'K/D', value: '1.24', inline: true },
        { name: 'Wins', value: '156', inline: true },
        { name: 'Kills', value: '4,521', inline: true },
        { name: 'Matches', value: '892', inline: true },
        { name: 'Win Rate', value: '17.5%', inline: true },
        { name: 'Avg Damage', value: '182', inline: true }
      )
      .setColor(0xff6600);
    
    await interaction.reply({ embeds: [embed] });
  }
};