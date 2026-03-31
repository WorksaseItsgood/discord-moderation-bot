const { SlashCommandBuilder, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { defaultConfig } = require('../../config');
const { muteEmbed, error: errorEmbed, COLOR } = require('../../utils/embedTemplates');

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
      const errEmbed = errorEmbed('User Not Found', 'User not found in this server!');
      return interaction.reply({ embeds: [errEmbed], ephemeral: true });
    }
    
    // Calculate mute duration
    let muteDurationMs = null;
    let durationText = duration || '28 days';
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
    let usedTimeout = false;
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
      usedTimeout = true;
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
          const errEmbed = errorEmbed('Mute Failed', roleError.message);
          return interaction.reply({ embeds: [errEmbed], ephemeral: true });
        }
      } else {
        const errEmbed = errorEmbed('Mute Failed', `${error.message}. No mute role configured.`);
        return interaction.reply({ embeds: [errEmbed], ephemeral: true });
      }
    }
    
    console.log(`[Mute] ${user.tag} muted in ${interaction.guild.name}. Reason: ${reason}, Duration: ${durationText}`);
    
    const action = muteDurationMs ? 'Temporary Mute Applied' : 'User Muted';
    const muteSuccessEmbed = muteEmbed(action, user, interaction.user, reason, durationText);
    
    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId(`mute_info_${user.id}`)
          .setLabel('Mute Info')
          .setStyle(ButtonStyle.Secondary)
          .setEmoji('ℹ️'),
        new ButtonBuilder()
          .setCustomId(`mute_unmute_${user.id}`)
          .setLabel('Unmute Now')
          .setStyle(ButtonStyle.Danger)
          .setEmoji('🔊')
      );
    
    await interaction.reply({ embeds: [muteSuccessEmbed], components: [row] });
    
    // Log to mod log channel
    const logChannel = interaction.guild.channels.cache.find(ch => 
      ch.name === 'mod-logs' || ch.name === 'moderation-logs'
    );
    
    if (logChannel) {
      await logChannel.send({ embeds: [muteSuccessEmbed] });
    }
  }
};