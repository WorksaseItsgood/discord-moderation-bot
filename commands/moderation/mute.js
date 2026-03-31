/**
 * Mute Command - Mute a user with duration buttons
 */

const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, PermissionFlagsBits } = require('discord.js');
const { modAction, success, error, COLORS } = require('../../utils/embedTemplates');
const { durationSelectMenu, confirmButton, cancelButton } = require('../../utils/buttonComponents');

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
    const botAvatar = client.user?.displayAvatarURL() || 'https://cdn.discordapp.com/embed/avatars/0.png';
    
    if (!member) {
      const errorEmbed = error('❌ User Not Found', 'User not found in this server!', { thumbnail: botAvatar });
      return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }
    
    // Calculate mute duration
    let muteDurationMs = null;
    let durationText = duration || '28 days (default)';
    
    if (duration) {
      const durationMatch = duration.match(/^(\d+)([dhms])$/i);
      if (durationMatch) {
        const value = parseInt(durationMatch[1]);
        const unit = durationMatch[2].toLowerCase();
        const multipliers = { d: 86400000, h: 3600000, m: 60000, s: 1000 };
        muteDurationMs = value * multipliers[unit];
        durationText = duration;
      }
    } else {
      // Default 28 day timeout
      muteDurationMs = 28 * 24 * 60 * 60 * 1000;
    }
    
    // Preview embed
    const previewEmbed = new EmbedBuilder()
      .setColor(COLORS.warning)
      .setAuthor({
        name: '🔇 Mute User',
        iconURL: botAvatar
      })
      .setTitle('🔇 Mute Preview')
      .setDescription('Select a duration and confirm to mute this user.')
      .setThumbnail(user.displayAvatarURL())
      .setFooter({
        text: 'CrowBot',
        iconURL: botAvatar
      })
      .setTimestamp()
      .addFields(
        { name: '👤 User', value: `${user}\n\`${user.id}\``, inline: true },
        { name: '🛡️ Moderator', value: `${interaction.user}\n\`${interaction.user.id}\``, inline: true },
        { name: '📝 Reason', value: reason, inline: false },
        { name: '⏱️ Duration', value: durationText, inline: true }
      );
    
    // Duration buttons
    const durationButtons = [
      new ButtonBuilder()
        .setCustomId('mute-5m')
        .setLabel('5m')
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId('mute-15m')
        .setLabel('15m')
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId('mute-30m')
        .setLabel('30m')
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId('mute-1h')
        .setLabel('1h')
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId('mute-6h')
        .setLabel('6h')
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId('mute-1d')
        .setLabel('1d')
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId('mute-7d')
        .setLabel('7d')
        .setStyle(ButtonStyle.Secondary)
    ];
    
    const durationRow = new ActionRowBuilder().addComponents(durationButtons);
    
    const buttonRow = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('mute-confirm')
          .setLabel('✅ Confirm Mute')
          .setStyle(ButtonStyle.Danger),
        new ButtonBuilder()
          .setCustomId('mute-cancel')
          .setLabel('❌ Cancel')
          .setStyle(ButtonStyle.Secondary)
      );
    
    await interaction.reply({ 
      embeds: [previewEmbed], 
      components: [durationRow, buttonRow],
      ephemeral: false
    });
    
    // Create collector
    const filter = i => i.customId.startsWith('mute-');
    const collector = interaction.message.createMessageComponentCollector({ filter, time: 60000 });
    
    let selectedDuration = durationText;
    
    collector.on('collect', async (i) => {
      const customId = i.customId;
      
      if (customId === 'mute-cancel') {
        const cancelEmbed = error('❌ Cancelled', 'Mute action has been cancelled.', { thumbnail: botAvatar });
        await i.update({ embeds: [cancelEmbed], components: [] });
        collector.stop();
        return;
      }
      
      if (customId === 'mute-confirm' || customId.startsWith('mute-')) {
        // Update selected duration
        if (customId.startsWith('mute-') && customId !== 'mute-confirm' && customId !== 'mute-cancel') {
          selectedDuration = customId.replace('mute-', '');
          
          // Update the preview with new duration
          const newEmbed = new EmbedBuilder()
            .setColor(COLORS.warning)
            .setAuthor({
              name: '🔇 Mute User',
              iconURL: botAvatar
            })
            .setTitle('🔇 Mute Preview')
            .setDescription('Select a duration and confirm to mute this user.')
            .setThumbnail(user.displayAvatarURL())
            .setFooter({
              text: 'CrowBot • Duration selected: ' + selectedDuration,
              iconURL: botAvatar
            })
            .setTimestamp()
            .addFields(
              { name: '👤 User', value: `${user}\n\`${user.id}\``, inline: true },
              { name: '🛡️ Moderator', value: `${interaction.user}\n\`${interaction.user.id}\``, inline: true },
              { name: '📝 Reason', value: reason, inline: false },
              { name: '⏱️ Duration', value: selectedDuration, inline: true }
            );
          
          await i.update({ embeds: [newEmbed] });
          
          // Calculate the actual duration in ms
          const durationMatch = selectedDuration.match(/^(\d+)([dhms])$/i);
          if (durationMatch) {
            const value = parseInt(durationMatch[1]);
            const unit = durationMatch[2].toLowerCase();
            const multipliers = { d: 86400000, h: 3600000, m: 60000, s: 1000 };
            muteDurationMs = value * multipliers[unit];
          }
          
          return;
        }
        
        // Confirm mute
        if (customId === 'mute-confirm') {
          try {
            // Max timeout is 28 days
            const timeoutDuration = Math.min(muteDurationMs, 28 * 24 * 60 * 60 * 1000);
            await member.timeout(timeoutDuration, reason);
          } catch (err) {
            // Fallback to role-based mute
            const errorEmbed = error('❌ Error', `Could not timeout user: ${err.message}`, { thumbnail: botAvatar });
            await i.update({ embeds: [errorEmbed], components: [] });
            console.error(`[Mute] Error:`, err);
            return;
          }
          
          console.log(`[Mute] ${user.tag} muted in ${interaction.guild.name}. Duration: ${selectedDuration}`);
          
          // Success embed
          const successEmbed = modAction('Mute', user, interaction.user, reason, {
            duration: selectedDuration,
            thumbnail: user.displayAvatarURL()
          });
          
          await i.update({ embeds: [successEmbed], components: [] });
          
          // Log to mod log channel
          const logChannel = interaction.guild.channels.cache.find(ch => 
            ch.name === 'mod-logs' || ch.name === 'moderation-logs'
          );
          
          if (logChannel) {
            await logChannel.send({ embeds: [successEmbed] });
          }
          
          collector.stop();
        }
      }
    });
    
    collector.on('end', (collected, reason) => {
      if (reason === 'time') {
        error('⏱️ Timed Out', 'Mute confirmation timed out.', { thumbnail: botAvatar })
          .then(e => interaction.editReply({ embeds: [e], components: [] }))
          .catch(() => {});
      }
    });
  }
};