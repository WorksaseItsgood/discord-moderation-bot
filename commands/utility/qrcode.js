/**
 * QRCode Command - Generate a QR code
 */

const { SlashCommandBuilder, EmbedBuilder, AttachmentBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('qrcode')
    .setDescription('Generate a QR code')
    .addStringOption(option =>
      option.setName('text')
        .setDescription('Text or URL to encode')
        .setRequired(true)
    ),
  
  async execute(interaction, client) {
    const text = interaction.options.getString('text');
    
    // Use QR Server API
    const url = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(text)}`;
    
    const embed = new EmbedBuilder()
      .setTitle('📱 QR Code')
      .setDescription(`Data: ${text}`)
      .setImage(url)
      .setColor(0x0099ff);
    
    await interaction.reply({ embeds: [embed] });
  }
};