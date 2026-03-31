/**
 * Wikipedia Command - Search Wikipedia
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('wikipedia')
    .setDescription('Search Wikipedia')
    .addStringOption(option =>
      option.setName('query')
        .setDescription('Search query')
        .setRequired(true)
    ),
  
  async execute(interaction, client) {
    const query = interaction.options.getString('query');
    
    try {
      const res = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`);
      const data = await res.json();
      
      if (data.type === 'no-match' || data.title === 'Not found.') {
        return interaction.reply({ content: 'No results found!', ephemeral: true });
      }
      
      const embed = new EmbedBuilder()
        .setTitle(`📚 ${data.title}`)
        .setDescription(data.extract || 'No description available')
        .addFields(
          { name: '🔗 Read more', value: data.content_urls?.desktop?.page || 'N/A' }
        )
        .setColor(0x0099ff);
      
      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      await interaction.reply({ content: 'Failed to search Wikipedia!', ephemeral: true });
    }
  }
};