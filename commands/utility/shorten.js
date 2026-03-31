/**
 * Shorten URL Command - Shorten a URL
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('shorten')
    .setDescription('Shorten a URL')
    .addStringOption(option =>
      option.setName('url')
        .setDescription('URL to shorten')
        .setRequired(true)
    ),
  
  async execute(interaction, client) {
    const url = interaction.options.getString('url');
    
    try {
      // Use is.gd API (free, no auth required)
      const res = await fetch(`https://is.gd/create.php?format=simple&url=${encodeURIComponent(url)}`);
      const shortUrl = await res.text();
      
      if (shortUrl.startsWith('Error:')) {
        return interaction.reply({ content: 'Failed to shorten URL!', ephemeral: true });
      }
      
      const embed = new EmbedBuilder()
        .setTitle('🔗 URL Shortened')
        .addFields(
          { name: 'Original', value: url },
          { name: 'Short', value: shortUrl }
        )
        .setColor(0x00ff00);
      
      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      await interaction.reply({ content: 'Failed to shorten URL!', ephemeral: true });
    }
  }
};