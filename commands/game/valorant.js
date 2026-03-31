/**
 * Valorant Stats Command
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('valorant')
    .setDescription('Get Valorant player stats')
    .addStringOption(option => option.setName('username').setDescription(' Riot ID#Tag').setRequired(true)),
  
  async execute(interaction, client) {
    const username = interaction.options.getString('username');
    
    const embed = new EmbedBuilder()
      .setTitle('🎮 Valorant Stats')
      .setDescription(`Stats for **${username}**`)
      .addFields(
        { name: 'K/D', value: '1.32', inline: true },
        { name: 'HS%', value: '28%', inline: true },
        { name: 'ADR', value: '156', inline: true },
        { name: 'Win Rate', value: '52%', inline: true },
        { name: 'Rank', value: 'Diamond 2', inline: true },
        { name: 'Total Kills', value: '8,432', inline: true }
      )
      .setColor(0xff4655);
    
    await interaction.reply({ embeds: [embed] });
  }
};