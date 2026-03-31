const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

// Manga command - Manga info lookup
module.exports = {
  data: new SlashCommandBuilder()
    .setName('manga')
    .setDescription('Get manga information')
    .addStringOption(option =>
      option.setName('search')
        .setDescription('Manga name to search')
        .setRequired(true)),
  async execute(interaction, client) {
    const search = interaction.options.getString('search');
    
    const embed = new EmbedBuilder()
      .setTitle('Manga Lookup: ' + search)
      .setColor(0x2ecc71)
      .setDescription('API integration required for full data.')
      .addFields([
        { name: 'Title', value: search, inline: true },
        { name: 'Status', value: 'Not found (API needed)', inline: true },
        { name: 'Chapters', value: 'N/A', inline: true },
        { name: 'Score', value: 'N/A', inline: true },
        { name: 'Genres', value: 'N/A', inline: true },
        { name: 'Author', value: 'N/A', inline: true }
      ])
      .setFooter({ text: 'Use Jikan API for full manga data' });
    
    await interaction.reply({ embeds: [embed] });
  }
};