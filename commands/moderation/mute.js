const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { defaultConfig } = require('../config');

// Mute command - supports timeout and role-based mute
module.exports = {
  data: new SlashCommandBuilder()
    .setName('mute')
    .setDescription('Mute a user in text and voice')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('User to mute')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('Reason for mute')
        .setRequired(false))
    .addStringOption(option =>
      option.setName('duration')
        .setDescription('Mute duration (e.g., 7d, 24h, 30m)')
        .setRequired(false)),
  permissions: [PermissionFlagsBits.ModerateMembers],
  async execute(interaction, client) {
    const user = interaction.options.getUser('user');
    const reason = interaction.options.getString('reason') || 'No reason provided';
    const duration = interaction.options.getString('duration');
    
    const member = interaction.guild.members.cache.get(user.id);
    if (!member) {
      return interaction.reply({
        content: '❌ User not found in this server!',
        ephemeral: true
      });
    }
    
    // Calculate mute duration
    let muteDurationMs = null;
    if (duration) {
      const durationMatch = duration.match(/^(\d+)([dhms])$/i);
      if (durationMatch) {
        const value = parseInt(durationMatch[1]);
        const unit = durationMatch[2].toLowerCase();
        const multipliers = { d: 86400000, h: 3600000, m: 60000, s: 1000 };
        muteDurationMs = value * multipliers[unit];
      }
    }
    
    // Try timeout first (Discord native)
    try {
      if (muteDurationMs) {
        // Max timeout is 28 days
        const timeoutDuration = Math.min(muteDurationMs, 28 * 24 * 60 * 60 * 1000);
        await member.timeout(timeoutDuration, reason);
      } else {
        // Default 28 day timeout if no duration specified
        const timeoutDuration = 28 * 24 * 60 * 60 * 1000;
        await member.timeout(timeoutDuration, reason);
      }
    } catch (error) {
      // If timeout fails, try role-based mute
      const muteRoleId = defaultConfig.moderation?.muteRole;
      if (muteRoleId) {
        try {
          const muteRole = interaction.guild.roles.cache.get(muteRoleId);
          if (muteRole) {
            await member.roles.add(muteRole, reason);
          } else {
            throw new Error('Mute role not found');
          }
        } catch (roleError) {
          return interaction.reply({
            content: `❌ Error muting user: ${roleError.message}`,
            ephemeral: true
          });
        }
      } else {
        return interaction.reply({
          content: `❌ Error muting user: ${error.message}. No mute role configured.`,
          ephemeral: true
        });
      }
    }
    
    const durationText = duration || '28 days';
    console.log(`[Mute] ${user.tag} muted in ${interaction.guild.name}. Reason: ${reason}, Duration: ${durationText}`);
    
    const embed = new EmbedBuilder()
      .setTitle('🔇 User Muted')
      .setColor(0xffaa00)
      .addFields(
        { name: 'User', value: `${user} (${user.id})`, inline: true },
        { name: 'Reason', value: reason, inline: true },
        { name: 'Duration', value: durationText, inline: true }
      ));
    
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