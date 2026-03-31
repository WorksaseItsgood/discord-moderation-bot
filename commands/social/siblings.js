/**
 * Siblings Command
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('siblings')
    .setDescription('View your siblings'),
  
  async execute(interaction, client) {
    const embed = new EmbedBuilder()
      .setTitle('👫 Your Siblings')
      .setDescription('You have no siblings!')
      .setColor(0x00ff00);
    
    await interaction.reply({ embeds: [embed] });
  }
};