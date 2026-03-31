/**
 * Ban List Command
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('banlist')
    .setDescription('View banned users'),
  
  async execute(interaction, client) {
    const embed = new EmbedBuilder()
      .setTitle('🚫 Banned Users')
      .setDescription('• User1#1234 - Reason\n• User2#5678 - Reason')
      .setColor(0xff0000);
    
    await interaction.reply({ embeds: [embed] });
  }
};