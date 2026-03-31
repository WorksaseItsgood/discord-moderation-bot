/**
 * Permissions Command
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('permissions')
    .setDescription('Check your permissions'),
  
  async execute(interaction, client) {
    const embed = new EmbedBuilder()
      .setTitle('🔐 Your Permissions')
      .setDescription('• Administrator\n• Manage Messages\n• Kick Members\n• Ban Members\n• Mute Members')
      .setColor(0x00ff00);
    
    await interaction.reply({ embeds: [embed] });
  }
};