/**
 * Barcode Command
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('barcode')
    .setDescription('Generate a barcode')
    .addStringOption(option => option.setName('code').setDescription('Code number').setRequired(true)),
  
  async execute(interaction, client) {
    const code = interaction.options.getString('code');
    
    await interaction.reply({ content: `📊 Barcode generated: ${code}` });
  }
};