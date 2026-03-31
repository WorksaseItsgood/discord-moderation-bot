/**
 * Warn Command - Warn a user with beautiful UI
 */

const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, PermissionFlagsBits } = require('discord.js');
const { modAction, success, error, COLORS } = require('../../utils/embedTemplates');
const { dangerButton, primaryButton, confirmButton, cancelButton } = require('../../utils/buttonComponents');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('warn')
    .setDescription('Warn a user')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('User to warn')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('Reason for warning')
        .setRequired(false))
    .addBooleanOption(option =>
      option.setName('dm')
        .setDescription('DM the user about the warning')
        .setRequired(false)),
  
  permissions: [PermissionFlagsBits.ModerateMembers],
  
  async execute(interaction, client) {
    const user = interaction.options.getUser('user');
    const reason = interaction.options.getString('reason') || 'No reason provided';
    const dm = interaction.options.getBoolean('dm') ?? true;
    
    const member = interaction.guild.members.cache.get(user.id);
    const botAvatar = client.user?.displayAvatarURL() || 'https://cdn.discordapp.com/embed/avatars/0.png';
    
    // Initialize warnings storage if not exists
    if (!client.warnings) {
      client.warnings = new Map();
    }
    
    const guildWarnings = client.warnings.get(interaction.guild.id) || [];
    const userWarnings = guildWarnings.filter(w => w.userId === user.id);
    const warnCount = userWarnings.length + 1;
    
    // Create warning preview embed
    const previewEmbed = new EmbedBuilder()
      .setColor(COLORS.warning)
      .setAuthor({
        name: '⚠️ Warn User',
        iconURL: botAvatar
      })
      .setTitle('⚠️ Warning Preview')
      .setDescription('Are you sure you want to warn this user?')
      .setThumbnail(user.displayAvatarURL())
      .setFooter({
        text: 'CrowBot • Click Confirm to warn',
        iconURL: botAvatar
      })
      .setTimestamp()
      .addFields(
        { name: '👤 User', value: `${user}\n\`${user.id}\``, inline: true },
        { name: '🛡️ Moderator', value: `${interaction.user}\n\`${interaction.user.id}\``, inline: true },
        { name: '📝 Reason', value: reason, inline: false },
        { name: '⚠️ Warning #', value: `**${warnCount}** for this user`, inline: true },
        { name: '📨 Send DM', value: dm ? '✅ Yes' : '❌ No', inline: true }
      );
    
    // Reason quick select
    const reasonSelect = new StringSelectMenuBuilder()
      .setCustomId('warn-reason-select')
      .setPlaceholder('Select a reason...')
      .addOptions(
        new StringSelectMenuOptionBuilder()
          .setLabel('⚠️ Breaking Rules')
          .setValue('Breaking server rules'),
        new StringSelectMenuOptionBuilder()
          .setLabel('📢 Spam')
          .setValue('Spam'),
        new StringSelectMenuOptionBuilder()
          .setLabel('😠 Harassment')
          .setValue('Harassment'),
        new StringSelectMenuOptionBuilder()
          .setLabel('💬 Inappropriate Language')
          .setValue('Inappropriate language'),
        new StringSelectMenuOptionBuilder()
          .setLabel('🔗 Unwanted Links')
          .setValue('Unwanted links'),
        new StringSelectMenuOptionBuilder()
          .setLabel('🎭 Spam/Flooding')
          .setValue('Spam/Flooding'),
        new StringSelectMenuOptionBuilder()
          .setLabel('❓ Other')
          .setValue('Other')
      );
    
    const buttonRow = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('warn-confirm')
          .setLabel('✅ Confirm Warn')
          .setStyle(ButtonStyle.Danger),
        new ButtonBuilder()
          .setCustomId('warn-cancel')
          .setLabel('❌ Cancel')
          .setStyle(ButtonStyle.Secondary)
      );
    
    const selectRow = new ActionRowBuilder().addComponents(reasonSelect);
    
    await interaction.reply({ 
      embeds: [previewEmbed], 
      components: [selectRow, buttonRow],
      ephemeral: false
    });
    
    // Create collector for button responses
    const filter = i => i.customId === 'warn-confirm' || i.customId === 'warn-cancel';
    const collector = interaction.message.createMessageComponentCollector({ filter, time: 60000 });
    
    collector.on('collect', async (i) => {
      if (i.customId === 'warn-cancel') {
        const cancelEmbed = error('❌ Cancelled', 'Warn action has been cancelled.', { thumbnail: botAvatar });
        await i.update({ embeds: [cancelEmbed], components: [] });
        collector.stop();
        return;
      }
      
      if (i.customId === 'warn-confirm') {
        // Add to warnings
        const warning = {
          id: guildWarnings.length + 1,
          userId: user.id,
          userTag: user.tag,
          reason: reason,
          moderator: interaction.user.tag,
          timestamp: Date.now(),
          expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000 // 30 days
        };
        
        guildWarnings.push(warning);
        client.warnings.set(interaction.guild.id, guildWarnings);
        
        console.log(`[Warn] ${user.tag} warned in ${interaction.guild.name}. Reason: ${reason}. Total: ${warnCount}`);
        
        // Try to DM user
        let dmSent = false;
        if (dm) {
          const dmEmbed = new EmbedBuilder()
            .setColor(COLORS.warning)
            .setAuthor({
              name: '⚠️ You have been warned',
              iconURL: botAvatar
            })
            .setTitle('⚠️ Warning from ' + interaction.guild.name)
            .setDescription(`You have received a warning.`)
            .setThumbnail(interaction.guild.iconURL())
            .addFields(
              { name: '📝 Reason', value: reason },
              { name: '⚠️ Total Warnings', value: String(warnCount) }
            )
            .setFooter({
              text: 'CrowBot',
              iconURL: botAvatar
            })
            .setTimestamp();
          
          try {
            await user.send({ embeds: [dmEmbed] });
            dmSent = true;
          } catch (err) {
            console.log(`[Warn] Could not DM user ${user.tag}:`, err.message);
          }
        }
        
        // Success embed
        const successEmbed = modAction('Warn', user, interaction.user, reason, {
          duration: `Warning #${warnCount}`,
          dmSent: dmSent,
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
    });
    
    collector.on('end', (collected, reason) => {
      if (reason === 'time') {
        error('⏱️ Timed Out', 'Warn confirmation timed out.', { thumbnail: botAvatar })
          .then(e => interaction.editReply({ embeds: [e], components: [] }))
          .catch(() => {});
      }
    });
  }
};