/**
 * Meme Command - Get a random meme
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('meme')
    .setDescription('Get a random meme'),
  
  async execute(interaction, client) {
    const embed = new EmbedBuilder()
      .setTitle('📝 Random Meme')
      .setDescription('Title: When you...')
      .setImage('https://example.com/meme.jpg')
      .setColor(0x00ff00);
    
    await interaction.reply({ embeds: [embed] });
  }
};