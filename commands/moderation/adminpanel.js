/**
 * Admin Panel Command
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('adminpanel')
    .setDescription('Open the admin panel'),
  
  async execute(interaction, client) {
    const embed = new EmbedBuilder()
      .setTitle('⚙️ Admin Panel')
      .setDescription('Admin Actions:\n• Server Settings\n• AutoMod Config\n• Role Management\n• Channel Management\n• Mass Actions')
      .setColor(0xff0000);
    
    await interaction.reply({ embeds: [embed] });
  }
};