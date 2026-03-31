/**
 * Family Tree Command
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('familytree')
    .setDescription('View your family tree'),
  
  async execute(interaction, client) {
    const embed = new EmbedBuilder()
      .setTitle('🌳 Family Tree')
      .setDescription('Your family:\n• Parents: Unknown\n• Siblings: None\n• Children: None\n• Spouse: None')
      .setColor(0x00ff00);
    
    await interaction.reply({ embeds: [embed] });
  }
};