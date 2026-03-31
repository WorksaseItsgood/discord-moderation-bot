/**
 * Role Stats Command
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('rolestats')
    .setDescription('View role statistics'),
  
  async execute(interaction, client) {
    const guild = interaction.guild;
    
    const embed = new EmbedBuilder()
      .setTitle('📊 Role Stats')
      .addFields(
        { name: 'Total Roles', value: guild.roles.cache.size.toString(), inline: true },
        { name: 'Online Roles', value: '8', inline: true },
        { name: 'Admin Roles', value: '3', inline: true }
      )
      .setColor(0x00ff00);
    
    await interaction.reply({ embeds: [embed] });
  }
};