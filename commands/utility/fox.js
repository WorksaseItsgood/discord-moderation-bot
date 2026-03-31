/**
 * Fox Command - Random fox image
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('fox')
    .setDescription('Get a random fox image'),
  
  async execute(interaction, client) {
    try {
      const res = await fetch('https://randomfox.ca/floof/');
      const data = await res.json();
      
      const embed = new EmbedBuilder()
        .setTitle('🦊 Random Fox')
        .setImage(data.image)
        .setColor(0xff6600);
      
      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      await interaction.reply({ content: 'Failed to fetch fox image!', ephemeral: true });
    }
  }
};