/**
 * Ban Command - Ban a user with beautiful UI
 */

const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, PermissionFlagsBits } = require('discord.js');
const { modAction, success, error, COLORS } = require('../../utils/embedTemplates');
const { reasonSelectMenu, dangerButton, primaryButton, confirmButton, cancelButton } = require('../../utils/buttonComponents');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ban')
    .setDescription('Ban a user from the server')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('User to ban')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('Reason for ban')
        .setRequired(false))
    .addStringOption(option =>
      option.setName('duration')
        .setDescription('Ban duration (e.g., 7d, 24h, 30m) - leave empty for permanent')
        .setRequired(false))
    .addBooleanOption(option =>
      option.setName('dm')
        .setDescription('DM the user about the ban')
        .setRequired(false)),
  
  permissions: [PermissionFlagsBits.BanMembers],
  
  async execute(interaction, client) {
    const user = interaction.options.getUser('user');
    const reason = interaction.options.getString('reason') || 'No reason provided';
    const duration = interaction.options.getString('duration');
    const dm = interaction.options.getBoolean('dm') ?? true;
    
    const member = interaction.guild.members.cache.get(user.id);
    const botAvatar = client.user?.displayAvatarURL() || 'https://cdn.discordapp.com/embed/avatars/0.png';
    
    // Calculate ban duration in milliseconds
    let banDurationMs = null;
    let durationText = 'Permanent';
    if (duration) {
      const durationMatch = duration.match(/^(\d+)([dhms])$/i);
      if (durationMatch) {
        const value = parseInt(durationMatch[1]);
        const unit = durationMatch[2].toLowerCase();
        const multipliers = { d: 86400000, h: 3600000, m: 60000, s: 1000 };
        banDurationMs = value * multipliers[unit];
        durationText = duration;
      }
    }
    
    // Check if user is banable
    if (member) {
      if (!member.bannable) {
        const errorEmbed = error('❌ Cannot Ban', `I cannot ban **${user.username}**. They may have higher permissions than me.`, {
          thumbnail: user.displayAvatarURL()
        });
        return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
      }
    }
    
    // Create confirmation embed (show preview before banning)
    const confirmEmbed = new EmbedBuilder()
      .setColor(COLORS.error)
      .setAuthor({
        name: '⚠️ Confirm Ban',
        iconURL: botAvatar
      })
      .setTitle('🔨 Ban Preview')
      .setDescription('Are you sure you want to ban this user?')
      .setThumbnail(user.displayAvatarURL())
      .setFooter({
        text: 'CrowBot • Click Confirm to ban, Cancel to abort',
        iconURL: botAvatar
      })
      .setTimestamp()
      .addFields(
        { name: '👤 User', value: `${user}\n\`${user.id}\``, inline: true },
        { name: '🛡️ Moderator', value: `${interaction.user}\n\`${interaction.user.id}\``, inline: true },
        { name: '📝 Reason', value: reason, inline: false },
        { name: '⏱️ Duration', value: durationText, inline: true },
        { name: '📨 Send DM', value: dm ? '✅ Yes' : '❌ No', inline: true }
      );
    
    // Create action rows with buttons and select menu
    const reasonSelect = new StringSelectMenuBuilder()
      .setCustomId('ban-reason-select')
      .setPlaceholder('Select a reason...')
      .addOptions(
        new StringSelectMenuOptionBuilder()
          .setLabel('🔨 Breaking Rules')
          .setValue('Breaking server rules'),
        new StringSelectMenuOptionBuilder()
          .setLabel('📢 Spam')
          .setValue('Spam'),
        new StringSelectMenuOptionBuilder()
          .setLabel('😠 Harassment')
          .setValue('Harassment'),
        new StringSelectMenuOptionBuilder()
          .setLabel('🚫 Hate Speech')
          .setValue('Hate speech'),
        new StringSelectMenuOptionBuilder()
          .setLabel('💣 Raiding')
          .setValue('Raiding'),
        new StringSelectMenuOptionBuilder()
          .setLabel('🎭 Impersonation')
          .setValue('Impersonation'),
        new StringSelectMenuOptionBuilder()
          .setLabel('🔞 NSFW Content')
          .setValue('NSFW content'),
        new StringSelectMenuOptionBuilder()
          .setLabel('📢 Advertising')
          .setValue('Advertising'),
        new StringSelectMenuOptionBuilder()
          .setLabel('❓ Other')
          .setValue('Other')
      );
    
    const buttonRow = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('ban-confirm')
          .setLabel('✅ Confirm Ban')
          .setStyle(ButtonStyle.Danger),
        new ButtonBuilder()
          .setCustomId('ban-cancel')
          .setLabel('❌ Cancel')
          .setStyle(ButtonStyle.Secondary)
      );
    
    const selectRow = new ActionRowBuilder().addComponents(reasonSelect);
    
    await interaction.reply({ 
      embeds: [confirmEmbed], 
      components: [selectRow, buttonRow],
      ephemeral: false
    });
    
    // Create collector for button responses
    const filter = i => i.customId === 'ban-confirm' || i.customId === 'ban-cancel';
    const collector = interaction.message.createMessageComponentCollector({ filter, time: 60000 });
    
    collector.on('collect', async (i) => {
      if (i.customId === 'ban-cancel') {
        const cancelEmbed = error('❌ Cancelled', 'Ban action has been cancelled.', { thumbnail: botAvatar });
        await i.update({ embeds: [cancelEmbed], components: [] });
        collector.stop();
        return;
      }
      
      if (i.customId === 'ban-confirm') {
        // Try to DM user
        let dmSent = false;
        if (dm) {
          const dmEmbed = new EmbedBuilder()
            .setColor(COLORS.error)
            .setAuthor({
              name: '🔨 You have been banned',
              iconURL: botAvatar
            })
            .setTitle('🔨 Banned from ' + interaction.guild.name)
            .setDescription(`You have been banned from the server.`)
            .setThumbnail(interaction.guild.iconURL())
            .addFields(
              { name: '📝 Reason', value: reason },
              { name: '⏱️ Duration', value: durationText }
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
            console.log(`[Ban] Could not DM user ${user.tag}:`, err.message);
          }
        }
        
        // Ban the user
        try {
          const banOptions = {
            reason: `${reason}${banDurationMs ? ` (Temp ban: ${duration})` : ''}`
          };
          
          if (banDurationMs) {
            // For temporary bans
            await interaction.guild.bans.create(user.id, banOptions);
            
            // Store temp ban info
            if (!client.tempBans) client.tempBans = new Map();
            client.tempBans.set(user.id, {
              guildId: interaction.guild.id,
              unbanAt: Date.now() + banDurationMs
            });
            
            // Schedule unban
            setTimeout(async () => {
              try {
                await interaction.guild.bans.remove(user.id, 'Temporary ban expired');
                client.tempBans.delete(user.id);
                console.log(`[Ban] Temporary ban expired for ${user.tag}`);
              } catch (err) {
                console.error(`[Ban] Error unbanning ${user.tag}:`, err);
              }
            }, banDurationMs);
          } else {
            await interaction.guild.bans.create(user.id, banOptions);
          }
        } catch (err) {
          const errorEmbed = error('❌ Error', `Error banning user: ${err.message}`, { thumbnail: botAvatar });
          await i.update({ embeds: [errorEmbed], components: [] });
          console.error(`[Ban] Error:`, err);
          return;
        }
        
        console.log(`[Ban] ${user.tag} (${user.id}) banned in ${interaction.guild.name}. Reason: ${reason}`);
        
        // Success embed
        const successEmbed = modAction('Ban', user, interaction.user, reason, {
          duration: durationText,
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
        error('⏱️ Timed Out', 'Ban confirmation timed out.', { thumbnail: botAvatar })
          .then(e => interaction.editReply({ embeds: [e], components: [] }))
          .catch(() => {});
      }
    });
  }
};