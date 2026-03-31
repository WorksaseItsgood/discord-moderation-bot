/**
 * Suggest Accept Command
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('suggestaccept')
    .setDescription('Accept a suggestion')
    .addIntegerOption(option => option.setName('id').setDescription('Suggestion ID').setRequired(true)),
  
  async execute(interaction, client) {
    const id = interaction.options.getInteger('id');
    
    await interaction.reply({ content: `✅ Accepted suggestion #${id}!` });
  }
};