const { SlashCommandBuilder } = require('discord.js');
const axios = require('axios');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('epic')
    .setDescription('Get current Epic Games free game'),
  async execute(interaction) {
    const freeGames = [
      { name: 'Check Epic Store', url: 'https://store.epicgames.com/free-games' }
    ];
    
    const embed = {
      title: '🎁 Epic Games Free',
      description: '[Check current free games](https://store.epicgames.com/free-games)',
      color: 0x2C3E50,
      timestamp: new Date().toISOString(),
    };

    await interaction.reply({ embeds: [embed] });
  },
};