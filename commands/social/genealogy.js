/**
 * Genealogy Command
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('genealogy')
    .setDescription('View your genealogy'),
  
  async execute(interaction, client) {
    await interaction.reply({ content: '📜 View your family history: Coming soon!' });
  }
};