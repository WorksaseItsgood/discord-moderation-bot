const { SlashCommandBuilder, AttachmentBuilder, EmbedBuilder } = require('discord.js');
const Canvas = require('canvas');

// Stonks command - Stonks meme
module.exports = {
  data: new SlashCommandBuilder()
    .setName('stonks')
    .setDescription('Create a stonks meme')
    .addStringOption(option =>
      option.setName('text')
        .setDescription('Text for the meme')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('type')
        .setDescription('Type (stonks or notstonks)')
        .setRequired(false)),
  async execute(interaction, client) {
    const text = interaction.options.getString('text');
    const type = interaction.options.getString('type') || 'stonks';
    
    const canvas = Canvas.createCanvas(500, 500);
    const ctx = canvas.getContext('2d');
    
    // Background
    ctx.fillStyle = type === 'stonks' ? '#00ff00' : '#ff0000';
    ctx.fillRect(0, 0, 500, 500);
    
    // Text
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 40px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(text, 250, 250);
    
    ctx.font = 'bold 30px Arial';
    ctx.fillText(type === 'stonks' ? 'STONKS' : 'NOT STONKS', 250, 350);
    
    const attachment = new AttachmentBuilder(canvas.toBuffer(), { name: 'stonks.png' });
    
    await interaction.reply({ files: [attachment] });
  }
};