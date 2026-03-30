/**
 * Balance Command - Check your economy balance
 */

const { SlashCommandBuilder, EmbedBuilder, AttachmentBuilder } = require('discord.js');
const path = require('path');
const Canvas = require('canvas');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('balance')
    .setDescription('Check your balance and bank')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('User to check (optional)')
    ),
  
  async execute(interaction, client) {
    const user = interaction.options.getUser('user') || interaction.user;
    const guildId = interaction.guildId;
    
    // Get or create user
    const userData = client.dbManager.getOrCreateUser(user.id, guildId);
    
    // Create balance card image
    const canvas = Canvas.createCanvas(400, 200);
    const ctx = canvas.getContext('2d');
    
    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, 400, 200);
    gradient.addColorStop(0, '#1a1a2e');
    gradient.addColorStop(1, '#16213e');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 400, 200);
    
    // Card border
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 3;
    ctx.strokeRect(10, 10, 380, 180);
    
    // User avatar
    try {
      const avatar = await Canvas.loadImage(user.displayAvatarURL({ extension: 'png', size: 128 }));
      ctx.beginPath();
      ctx.arc(60, 60, 35, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(avatar, 25, 25, 70, 70);
      ctx.restore();
    } catch (e) {
      // Default avatar circle
      ctx.beginPath();
      ctx.arc(60, 60, 35, 0, Math.PI * 2);
      ctx.fillStyle = '#333';
      ctx.fill();
    }
    
    // Username
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 20px Arial';
    ctx.fillText(user.username, 110, 50);
    
    // Level badge
    ctx.fillStyle = '#ffd700';
    ctx.font = 'bold 14px Arial';
    ctx.fillText(`Level ${userData.level}`, 110, 75);
    
    // Balance section
    ctx.fillStyle = '#00ff88';
    ctx.font = 'bold 16px Arial';
    ctx.fillText('💰 Cash:', 40, 130);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px Arial';
    ctx.fillText(`${userData.balance.toLocaleString()} coins`, 150, 130);
    
    // Bank section
    ctx.fillStyle = '#ffd700';
    ctx.font = 'bold 16px Arial';
    ctx.fillText('🏦 Bank:', 40, 165);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px Arial';
    ctx.fillText(`${userData.bank.toLocaleString()} coins`, 150, 165);
    
    // XP bar
    const xpProgress = userData.xp / (userData.level * 1000);
    ctx.fillStyle = '#333';
    ctx.fillRect(40, 185, 320, 10);
    ctx.fillStyle = '#9b59b6';
    ctx.fillRect(40, 185, Math.min(xpProgress * 320, 320), 10);
    
    const attachment = new AttachmentBuilder(canvas.toBuffer(), { name: 'balance.png' });
    
    const embed = new EmbedBuilder()
      .setTitle('💰 Economy Balance')
      .setColor(0x00ff00)
      .setImage('attachment://balance.png')
      .setFooter({ text: `Total Net Worth: ${(userData.balance + userData.bank).toLocaleString()} coins` });
    
    await interaction.reply({ embeds: [embed], files: [attachment] });
  }
};