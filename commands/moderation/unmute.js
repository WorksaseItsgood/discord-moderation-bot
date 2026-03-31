const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { defaultConfig } = require('../../config');

// Unmute command
module.exports = {
  data: new SlashCommandBuilder()
    .setName('unmute')
    .setDescription('Unmute a user')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('User to unmute')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('Reason for unmute')
        .setRequired(false)),
  permissions: [PermissionFlagsBits.ModerateMembers],
  async execute(interaction, client) {
    const user = interaction.options.getUser('user');
    const reason = interaction.options.getString('reason') || 'No reason provided';
    
    const member = interaction.guild.members.cache.get(user.id);
    if (!member) {
      return interaction.reply({
        content: '❌ User not found in this server!',
        ephemeral: true
      });
    }
    
    // Try to remove timeout first
    try {
      if (member.isCommunicationDisabled()) {
        await member.timeout(null, reason);
      }
    } catch (error) {
      console.log(`[Unmute] Could not remove timeout: ${error.message}`);
    }
    
    // Also try role-based unmute
    const muteRoleId = defaultConfig.moderation?.muteRole;
    if (muteRoleId) {
      const muteRole = interaction.guild.roles.cache.get(muteRoleId);
      if (muteRole && member.roles.cache.has(muteRoleId)) {
        try {
          await member.roles.remove(muteRole, reason);
        } catch (error) {
          console.log(`[Unmute] Could not remove mute role: ${error.message}`);
        }
      }
    }
    
    console.log(`[Unmute] ${user.tag} unmuted in ${interaction.guild.name}`);
    
    const embed = new EmbedBuilder()
      .setTitle('🔊 User Unmuted')
      .setColor(0x00ff00)
      .addFields(
        { name: 'User', value: `${user} (${user.id})`, inline: true },
        { name: 'Reason', value: reason, inline: true }
      );
    
    await interaction.reply({ embeds: [embed] });
    
    // Log to mod log channel
    const logChannel = interaction.guild.channels.cache.find(ch => 
      ch.name === 'mod-logs' || ch.name === 'moderation-logs'
    );
    
    if (logChannel) {
      await logChannel.send({ embeds: [embed] });
    }
  }
};