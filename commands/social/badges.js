/**
 * Badges Command
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('badges')
    .setDescription('View your badges'),
  
  async execute(interaction, client) {
    const embed = new EmbedBuilder()
      .setTitle('🏅 Your Badges')
      .setDescription('• New Member\n• Active')
      .setColor(0xffd700);
    
    await interaction.reply({ embeds: [embed] });
  }
};