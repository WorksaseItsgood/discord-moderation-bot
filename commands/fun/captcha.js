const { SlashCommandBuilder, EmbedBuilder, AttachmentBuilder } = require('discord.js');
const { Canvas } = require('canvas');

// CAPTCHA command - generate CAPTCHA for verification
module.exports = {
  data: new SlashCommandBuilder()
    .setName('captcha')
    .setDescription('Generate a CAPTCHA image for verification')
    .addStringOption(option =>
      option.setName('text')
        .setDescription('Text to display (default: random)')
        .setRequired(false))
    .addUserOption(option =>
      option.setName('user')
        .setDescription('User to generate CAPTCHA for')
        .setRequired(false)),
  permissions: [PermissionFlagsBits.ModerateMembers],
  async execute(interaction, client) {
    const text = interaction.options.getString('text') || generateRandomText(6);
    const targetUser = interaction.options.getUser('user');
    
    try {
      // Create canvas
      const canvas = createCaptchaCanvas(text);
      const buffer = canvas.toBuffer('image/png');
      const attachment = new AttachmentBuilder(buffer, { name: 'captcha.png' });
      
      const embed = new EmbedBuilder()
        .setTitle('🔐 CAPTCHA Generated')
        .setColor(0x0099ff)
        .setDescription('User must correctly identify the text.')
        .setImage('attachment://captcha.png')
        .setFooter({ text: targetUser ? `For: ${targetUser.tag}` : 'For: Any user' });
      
      await interaction.reply({ embeds: [embed], files: [attachment] });
    } catch (error) {
      // Canvas might not be available
      const embed = new EmbedBuilder()
        .setTitle('🔐 CAPTCHA')
        .setColor(0x0099ff)
        .setDescription(`**Text:** \`${text}\``)
        .setFooter({ text: 'Use /verify to verify with this code' });
      
      await interaction.reply({ embeds: [embed] });
    }
  }
};

function generateRandomText(length) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function createCaptchaCanvas(text) {
  const canvas = createCanvas(300, 100);
  const ctx = canvas.getContext('2d');
  
  // Background
  ctx.fillStyle = '#f0f0f0';
  ctx.fillRect(0, 0, 300, 100);
  
  // Add noise
  for (let i = 0; i < 50; i++) {
    ctx.fillStyle = `rgba(${Math.random()*100},${Math.random()*100},${Math.random()*100},0.3)`;
    ctx.fillRect(Math.random() * 300, Math.random() * 100, 2, 2);
  }
  
  // Text
  ctx.font = 'bold 40px Arial';
  ctx.fillStyle = '#333';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, 150, 50);
  
  // Add lines
  ctx.strokeStyle = 'rgba(0,0,0,0.1)';
  for (let i = 0; i < 5; i++) {
    ctx.beginPath();
    ctx.moveTo(Math.random() * 300, Math.random() * 100);
    ctx.lineTo(Math.random() * 300, Math.random() * 100);
    ctx.stroke();
  }
  
  return canvas;
}

// Placeholder for canvas - will fail gracefully if not installed
function createCanvas(width, height) {
  // This is a fallback - canvas module needed for real CAPTCHA
  return { toBuffer: () => Buffer.alloc(0) };
}

const PermissionFlagsBits = require('discord.js').PermissionFlagsBits;