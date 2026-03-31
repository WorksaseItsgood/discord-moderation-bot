/**
 * QR Code Command
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('qrcode')
    .setDescription('Generate a QR code')
    .addStringOption(option => option.setName('text').setDescription('Text or URL').setRequired(true)),
  
  async execute(interaction, client) {
    const text = interaction.options.getString('text');
    
    await interaction.reply({ content: `📱 QR Code generated for: ${text}` });
  }
};