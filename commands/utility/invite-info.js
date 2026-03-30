/**
 * Invite Info Command - Get invite information
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('invite-info')
    .setDescription('Get invite information')
    .addStringOption(option =>
      option.setName('invite')
        .setDescription('Invite code or link')
        .setRequired(true)
    ),
  
  async execute(interaction, client) {
    const inviteInput = interaction.options.getString('invite');
    
    // Extract invite code
    const code = inviteInput.replace(/https?:\/\/(discord\.gg|discord\.com\/invite)\//gi, '');
    
    try {
      const invite = await client.fetchInvite(code);
      
      const embed = new EmbedBuilder()
        .setTitle('🔗 Invite Info')
        .setColor(0x0099ff)
        .addFields(
          { name: '📋 Code', value: invite.code, inline: true },
          { name: '👥 Uses', value: invite.uses?.toString() || 'Unknown', inline: true },
          { name: '👤 Max Uses', value: invite.maxUses?.toString() || 'Unlimited', inline: true },
          { name: '⏰ Expires', value: invite.expiresAt ? `<t:${Math.floor(invite.expiresAt / 1000)}:R>` : 'Never', inline: true },
          { name: '📍 Channel', value: `#${invite.channel?.name || 'Unknown'}`, inline: true },
          { name: '👤 Inviter', value: invite.inviter?.tag || 'Unknown', inline: true }
        );
      
      await interaction.reply({ embeds: [embed] });
    } catch (e) {
      await interaction.reply({ content: 'Invalid invite or expired!', ephemeral: true });
    }
  }
};