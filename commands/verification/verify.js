/**
 * Verify Command - Verify yourself with captcha
 */

const { SlashCommandBuilder, EmbedBuilder, ButtonStyle, ActionRowBuilder, ButtonBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('verify')
    .setDescription('Verify yourself to access the server'),
  
  async execute(interaction, client) {
    const userId = interaction.user.id;
    const guildId = interaction.guildId;
    
    // Check if already verified
    if (client.dbManager.isVerified(userId, guildId)) {
      const embed = new EmbedBuilder()
        .setTitle('✅ Already Verified')
        .setDescription('You are already verified!')
        .setColor(0x00ff00);
      
      return interaction.reply({ embeds: [embed], ephemeral: true });
    }
    
    // Get verification config
    const verifyRole = client.dbManager.getSetting('verify_role', guildId);
    
    // Generate random captcha code (6 characters)
    const code = generateCode(6);
    
    // Save verification code
    client.dbManager.createVerification(userId, guildId, code);
    
    // Create verification embed
    const embed = new EmbedBuilder()
      .setTitle('🔐 Verification')
      .setDescription('Complete the CAPTCHA below to verify you are human')
      .addFields(
        { name: '📝 Enter this code:', value: `**${code}**` },
        { name: '⚠️ Note', value: 'You have 3 attempts before being kicked!' }
      )
      .setColor(0x0099ff);
    
    // Create verify button - sends a modal
    const verifyButton = new ButtonBuilder()
      .setCustomId('verify-submit')
      .setLabel('🔐 Enter Code')
      .setStyle(ButtonStyle.Primary);
    
    const row = new ActionRowBuilder()
      .addComponents(verifyButton);
    
    // Store the code for modal validation
    client.pendingVerification = client.pendingVerification || new Map();
    client.pendingVerification.set(userId, code);
    
    const message = await interaction.reply({ 
      embeds: [embed], 
      components: [row],
      ephemeral: true,
      fetchReply: true
    });
    
    // Create modal interaction
    const filter = i => i.user.id === userId;
    
    try {
      const modalInteraction = await interaction.clientModalWaiter.waitForModalSubmit({
        filter,
        time: 120000 // 2 minutes
      });
      
      const enteredCode = modalInteraction.fields.getTextInputValue('code');
      
      if (enteredCode.toUpperCase() === code || enteredCode.toLowerCase() === code.toLowerCase()) {
        // Correct code!
        client.dbManager.verifyCode(userId, guildId, code);
        
        // Add verification role if configured
        if (verifyRole) {
          const role = interaction.guild.roles.cache.get(verifyRole);
          if (role) {
            await interaction.member.roles.add(role);
          }
        }
        
        const successEmbed = new EmbedBuilder()
          .setTitle('✅ Verification Complete!')
          .setDescription('You have been verified!')
          .setColor(0x00ff00);
        
        await modalInteraction.reply({ embeds: [successEmbed], ephemeral: true });
      } else {
        // Wrong code
        const failEmbed = new EmbedBuilder()
          .setTitle('❌ Verification Failed')
          .setDescription('Incorrect code! Try again.')
          .setColor(0xff0000);
        
        await modalInteraction.reply({ embeds: [failEmbed], ephemeral: true });
      }
    } catch (e) {
      // Timeout
      const timeoutEmbed = new EmbedBuilder()
        .setTitle('⏰ Verification Timeout')
        .setDescription('You took too long! Try again.')
        .setColor(0xffaa00);
      
      await interaction.followUp({ embeds: [timeoutEmbed], ephemeral: true });
    }
  }
};

// Generate random alphanumeric code
function generateCode(length) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Exclude confusing chars
  let code = '';
  
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return code;
}