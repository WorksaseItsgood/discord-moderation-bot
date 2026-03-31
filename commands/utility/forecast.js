/**
 * Forecast Command
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('forecast')
    .setDescription('Get weather forecast')
    .addStringOption(option => option.setName('city').setDescription('City name').setRequired(true)),
  
  async execute(interaction, client) {
    const city = interaction.options.getString('city');
    
    const embed = new EmbedBuilder()
      .setTitle(`📅 5-Day Forecast - ${city}`)
      .setDescription('Monday: ☀️ 75°F\nTuesday: ⛅ 72°F\nWednesday: 🌧️ 65°F\nThursday: ⛅ 70°F\nFriday: ☀️ 78°F')
      .setColor(0x00ccff);
    
    await interaction.reply({ embeds: [embed] });
  }
};