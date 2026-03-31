/**
 * Wikipedia Command
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('wikipedia')
    .setDescription('Search Wikipedia')
    .addStringOption(option => option.setName('query').setDescription('Query to search').setRequired(true)),
  
  async execute(interaction, client) {
    const query = interaction.options.getString('query');
    
    const embed = new EmbedBuilder()
      .setTitle(`📚 Wikipedia: ${query}`)
      .setDescription('Summary of the topic...')
      .setColor(0x00ff00);
    
    await interaction.reply({ embeds: [embed] });
  }
};