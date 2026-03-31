/**
 * IMDB Command - Search IMDB for movie/show
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('imdb')
    .setDescription('Search IMDB for a movie or show')
    .addStringOption(option =>
      option.setName('query')
        .setDescription('Movie or show name')
        .setRequired(true)
    ),
  
  async execute(interaction, client) {
    const query = interaction.options.getString('query');
    
    try {
      // Use OMDB API (requires API key, but has free tier)
      const apiKey = process.env.OMDB_API_KEY || '';
      
      if (!apiKey) {
        const embed = new EmbedBuilder()
          .setTitle(`🎬 ${query}`)
          .setDescription('IMDB API not configured. Add your OMDB API key to use this feature.')
          .setColor(0xf5c518);
        
        await interaction.reply({ embeds: [embed] });
        return;
      }
      
      const res = await fetch(`https://www.omdbapi.com/?t=${encodeURIComponent(query)}&apikey=${apiKey}`);
      const data = await res.json();
      
      if (data.Response === 'False') {
        return interaction.reply({ content: 'No results found!', ephemeral: true });
      }
      
      const embed = new EmbedBuilder()
        .setTitle(`🎬 ${data.Title} (${data.Year})`)
        .setDescription(data.Plot || 'No plot available')
        .addFields(
          { name: '⭐ Rating', value: data.imdbRating || 'N/A' },
          { name: '📅 Released', value: data.Released || 'N/A' },
          { name: '⏱️ Runtime', value: data.Runtime || 'N/A' },
          { name: '🎭 Genre', value: data.Genre || 'N/A' },
          { name: '🎬 Director', value: data.Director || 'N/A' },
          { name: '🎭 Actors', value: data.Actors || 'N/A' },
          { name: '🔗 IMDB', value: `https://www.imdb.com/title/${data.imdbID}` }
        )
        .setColor(0xf5c518);
      
      if (data.Poster && data.Poster !== 'N/A') {
        embed.setImage(data.Poster);
      }
      
      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      await interaction.reply({ content: 'Failed to search IMDB!', ephemeral: true });
    }
  }
};