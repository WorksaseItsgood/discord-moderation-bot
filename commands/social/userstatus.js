/**
 * Status Command
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('userstatus')
    .setDescription('Set your status')
    .addStringOption(option => option.setName('status').setDescription('Status').setRequired(true)),
  
  async execute(interaction, client) {
    const status = interaction.options.getString('status');
    
    await interaction.reply({ content: `📌 Status set to: ${status}` });
  }
};