/**
 * Wedding Command
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('wedding')
    .setDescription('Plan a wedding'),
  
  async execute(interaction, client) {
    await interaction.reply({ content: '💍 Wedding system: Coming soon!' });
  }
};