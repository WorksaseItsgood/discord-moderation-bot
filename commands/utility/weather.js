/**
 * Weather Command - Weather info
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('weather')
    .setDescription('Get weather info')
    .addStringOption(option =>
      option.setName('city')
        .setDescription('City name')
        .setRequired(true)
    ),
  
  async execute(interaction, client) {
    const city = interaction.options.getString('city');
    
    // Demo response - in production use OpenWeatherMap API
    const embed = new EmbedBuilder()
      .setTitle(`🌤️ Weather: ${city}`)
      .setDescription('Weather API not configured. Add your API key to use this feature.')
      .addFields(
        { name: 'Note', value: 'Configure weather API in bot settings' }
      )
      .setColor(0x0099ff);
    
    await interaction.reply({ embeds: [embed] });
  }
};