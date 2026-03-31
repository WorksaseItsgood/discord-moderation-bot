/**
 * Server Icon Command
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('servericon')
    .setDescription('Get server icon'),
  
  async execute(interaction, client) {
    const guild = interaction.guild;
    
    if (guild.icon) {
      await interaction.reply({ content: `📷 Server Icon: ${guild.iconURL()}` });
    } else {
      await interaction.reply({ content: '❌ This server has no icon!' });
    }
  }
};