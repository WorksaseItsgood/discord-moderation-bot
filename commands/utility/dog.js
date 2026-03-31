/**
 * Dog Command - Random dog image
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('dog')
    .setDescription('Get a random dog image'),
  
  async execute(interaction, client) {
    try {
      const res = await fetch('https://dog.ceo/api/breeds/image/random');
      const data = await res.json();
      
      const embed = new EmbedBuilder()
        .setTitle('🐕 Random Dog')
        .setImage(data.message)
        .setColor(0x0099ff);
      
      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      await interaction.reply({ content: 'Failed to fetch dog image!', ephemeral: true });
    }
  }
};