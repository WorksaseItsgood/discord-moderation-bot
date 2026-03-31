/**
 * Weather Command
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('weather')
    .setDescription('Get weather info')
    .addStringOption(option => option.setName('city').setDescription('City name').setRequired(true)),
  
  async execute(interaction, client) {
    const city = interaction.options.getString('city');
    
    const embed = new EmbedBuilder()
      .setTitle(`🌤️ Weather in ${city}`)
      .setDescription('Currently: 72°F (22°C)\nCondition: Partly Cloudy\nHumidity: 45%\nWind: 10 mph')
      .setColor(0x00ccff);
    
    await interaction.reply({ embeds: [embed] });
  }
};