/**
 * Children Command - View your children
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('children')
    .setDescription('View your children'),
  
  async execute(interaction, client) {
    const embed = new EmbedBuilder()
      .setTitle('👶 Your Children')
      .setDescription('You have no children yet!')
      .setColor(0x00ff00);
    
    await interaction.reply({ embeds: [embed] });
  }
};