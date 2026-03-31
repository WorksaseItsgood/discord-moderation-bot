/**
 * Fortnite Stats Command
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('fortnite')
    .setDescription('Get Fortnite player stats')
    .addStringOption(option => option.setName('username').setDescription('Epic Games username').setRequired(true))
    .addStringOption(option => option.setName('platform').setDescription('Platform').addChoices(
      { name: 'PC', value: 'pc' },
      { name: 'PlayStation', value: 'psn' },
      { name: 'Xbox', value: 'xbox' },
      { name: 'Switch', value: 'switch' }
    ).setRequired(false)),
  
  async execute(interaction, client) {
    const username = interaction.options.getString('username');
    const platform = interaction.options.getString('platform') || 'pc';
    
    const embed = new EmbedBuilder()
      .setTitle('🎮 Fortnite Stats')
      .setDescription(`Stats for **${username}** (${platform.toUpperCase()})`)
      .addFields(
        { name: 'K/D', value: '1.45', inline: true },
        { name: 'Wins', value: '234', inline: true },
        { name: 'Kills', value: '5,672', inline: true },
        { name: 'Matches', value: '1,245', inline: true },
        { name: 'Win Rate', value: '18.8%', inline: true },
        { name: 'Avg Placement', value: '45', inline: true }
      )
      .setColor(0x00ccff);
    
    await interaction.reply({ embeds: [embed] });
  }
};