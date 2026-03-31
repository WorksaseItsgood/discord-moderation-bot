/**
 * Suggest Reject Command
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('suggestreject')
    .setDescription('Reject a suggestion')
    .addIntegerOption(option => option.setName('id').setDescription('Suggestion ID').setRequired(true))
    .addStringOption(option => option.setName('reason').setDescription('Reason').setRequired(false)),
  
  async execute(interaction, client) {
    const id = interaction.options.getInteger('id');
    
    await interaction.reply({ content: `❌ Rejected suggestion #${id}` });
  }
};