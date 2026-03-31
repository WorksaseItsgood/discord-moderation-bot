const { SlashCommandBuilder } = require('discord.js');
const axios = require('axios');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('steam')
    .setDescription('Get Steam game info')
    .addStringOption(option =>
      option.setName('game')
        .setDescription('Game name to search')
        .setRequired(true)),
  async execute(interaction) {
    const game = interaction.options.getString('game');
    
    const embed = {
      title: '🎮 Steam',
      description: `Search: ${game}\n\n[Search on Steam](https://store.steampowered.com/search/?term=${encodeURIComponent(game)})`,
      color: 0x1B2838,
      timestamp: new Date().toISOString(),
    };

    await interaction.reply({ embeds: [embed] });
  },
};