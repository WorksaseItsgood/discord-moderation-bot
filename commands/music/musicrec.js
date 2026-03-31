/**
 * Music Recommendation Command
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('musicrec')
    .setDescription('Get music recommendations')
    .addStringOption(option => option.setName('genre').setDescription('Preferred genre').setRequired(false)),
  
  async execute(interaction, client) {
    const genres = ['pop', 'rock', 'jazz', 'classical', 'hip-hop', 'edm', 'r&b', 'country'];
    const genre = interaction.options.getString('genre') || genres[Math.floor(Math.random() * genres.length)];
    
    const embed = new EmbedBuilder()
      .setTitle('🎵 Music Recommendations')
      .setDescription(`Based on **${genre}**:\n\n• Song 1 - Artist 1\n• Song 2 - Artist 2\n• Song 3 - Artist 3\n• Song 4 - Artist 4\n• Song 5 - Artist 5`)
      .setColor(0x00ff00);
    
    await interaction.reply({ embeds: [embed] });
  }
};