/**
 * Cat Command - Random cat image
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('cat')
    .setDescription('Get a random cat image'),
  
  async execute(interaction, client) {
    try {
      const res = await fetch('https://api.thecatapi.com/v1/images/search');
      const data = await res.json();
      
      const embed = new EmbedBuilder()
        .setTitle('🐱 Random Cat')
        .setImage(data[0].url)
        .setColor(0x0099ff);
      
      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      await interaction.reply({ content: 'Failed to fetch cat image!', ephemeral: true });
    }
  }
};