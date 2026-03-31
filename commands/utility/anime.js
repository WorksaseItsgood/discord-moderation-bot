const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

// Anime command - Anime info lookup
module.exports = {
  data: new SlashCommandBuilder()
    .setName('anime')
    .setDescription('Get anime information')
    .addStringOption(option =>
      option.setName('search')
        .setDescription('Anime name to search')
        .setRequired(true)),
  async execute(interaction, client) {
    const search = interaction.options.getString('search');
    
    const embed = new EmbedBuilder()
      .setTitle('Anime Lookup: ' + search)
      .setColor(0x9b59b6)
      .setDescription('API integration required for full data.')
      .addFields([
        { name: 'Title', value: search, inline: true },
        { name: 'Status', value: 'Not found (API needed)', inline: true },
        { name: 'Episodes', value: 'N/A', inline: true },
        { name: 'Score', value: 'N/A', inline: true },
        { name: 'Genres', value: 'N/A', inline: true },
        { name: 'Year', value: 'N/A', inline: true }
      ])
      .setFooter({ text: 'Use Jikan API for full anime data' });
    
    await interaction.reply({ embeds: [embed] });
  }
};