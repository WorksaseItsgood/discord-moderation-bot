const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

// CAPTCHA verification code display
module.exports = {
  data: new SlashCommandBuilder()
    .setName('captcha')
    .setDescription('Generate a CAPTCHA code for verification')
    .addStringOption(option =>
      option.setName('length')
        .setDescription('Code length (4-8)')
        .setRequired(false))
    .addUserOption(option =>
      option.setName('user')
        .setDescription('Generate for specific user')
        .setRequired(false)),
  permissions: [PermissionFlagsBits.ModerateMembers],
  async execute(interaction, client) {
    const length = Math.min(8, Math.max(4, parseInt(interaction.options.getString('length') || '6')));
    const targetUser = interaction.options.getUser('user');
    
    // Generate random code
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < length; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    const embed = new EmbedBuilder()
      .setTitle('🔐 Verification Code')
      .setColor(0x0099ff)
      .setDescription(`**Code:** \`${code}\`${targetUser ? `\n\nFor: ${targetUser}` : ''}`)
      .setFooter({ text: 'User must repeat this code in /verify to get verified' });
    
    await interaction.reply({ embeds: [embed] });
  }
};

const PermissionFlagsBits = require('discord.js').PermissionFlagsBits;