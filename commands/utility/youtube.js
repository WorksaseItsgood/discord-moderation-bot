const { SlashCommandBuilder } = require('discord.js');
const axios = require('axios');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('youtube')
    .setDescription('Get YouTube video info')
    .addStringOption(option =>
      option.setName('query')
        .setDescription('Video title or URL')
        .setRequired(true)),
  async execute(interaction) {
    const query = interaction.options.getString('query');
    
    const embed = {
      title: '🎬 YouTube',
      description: `Search: ${query}\n\n[Search on YouTube](https://www.youtube.com/results?search_query=${encodeURIComponent(query)})`,
      color: 0xFF0000,
    };

    await interaction.reply({ embeds: [embed] });
  },
};