/**
 * Roles List Command
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('roleslist')
    .setDescription('List all server roles'),
  
  async execute(interaction, client) {
    const embed = new EmbedBuilder()
      .setTitle('📋 Server Roles')
      .setDescription('• @everyone\n• Moderator\n• Admin\n• VIP\n• Member\n• Bot')
      .setColor(0x00ff00);
    
    await interaction.reply({ embeds: [embed] });
  }
};