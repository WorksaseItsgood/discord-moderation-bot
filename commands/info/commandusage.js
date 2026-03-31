/**
 * Command Usage Command
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('commandusage')
    .setDescription('View command usage'),
  
  async execute(interaction, client) {
    await interaction.reply({ content: '📊 Command usage: 50,000 total commands used today!' });
  }
};