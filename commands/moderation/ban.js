const { SlashCommandBuilder, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { defaultConfig } = require('../../config');
const { banEmbed, error: errorEmbed, COLOR } = require('../../utils/embedTemplates');

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
    const guildConfig = defaultConfig;
    const dmOnAction = guildConfig.moderation?.dmOnAction ?? true;
    
    // Calculate ban duration in milliseconds
    let banDurationMs = null;
    let durationText = null;
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
        const errEmbed = errorEmbed('Cannot Ban', 'I cannot ban this user! They may have higher permissions than me.');
        return interaction.reply({ embeds: [errEmbed], ephemeral: true });
      }
    }
    
    // Try to ban the user
    try {
      const banOptions = {
        reason: `${reason}${banDurationMs ? ` (Temp ban: ${duration})` : ''}`
      };
      
      let dmSent = false;
      
      if (dm && dmOnAction) {
        const { EmbedBuilder } = require('discord.js');
        const dmEmbed = new EmbedBuilder()
          .setColor(COLOR.ERROR)
          .setTitle('🔨 You have been banned')
          .setDescription(`You were banned from **${interaction.guild.name}**`)
          .addFields(
            { name: 'Reason', value: reason, inline: false }
          );
        
        if (durationText) {
          dmEmbed.addFields({ name: 'Duration', value: durationText, inline: true });
        }
        
        dmEmbed
          .setFooter({ text: 'Niotic Moderation' })
          .setTimestamp();
        
        try {
          await user.send({ embeds: [dmEmbed] });
          dmSent = true;
        } catch (err) {
          console.log(`[Ban] Could not DM user ${user.tag}: ${err.message}`);
        }
      }
      
      if (banDurationMs) {
        // Temporary ban
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
          } catch (error) {
            console.error(`[Ban] Error unbanning ${user.tag}:`, error);
          }
        }, banDurationMs);
      } else {
        await interaction.guild.bans.create(user.id, banOptions);
      }
      
      console.log(`[Ban] ${user.tag} (${user.id}) banned in ${interaction.guild.name}. Reason: ${reason}`);
      
      // Build success embed
      const action = banDurationMs ? 'Temporary Ban Issued' : 'User Banned';
      const banSuccessEmbed = banEmbed(action, user, interaction.user, reason, durationText);
      
      const row = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId(`ban_info_${user.id}`)
            .setLabel('Ban Info')
            .setStyle(ButtonStyle.Secondary)
            .setEmoji('ℹ️'),
          new ButtonBuilder()
            .setCustomId(`ban_unban_${user.id}`)
            .setLabel('Unban Now')
            .setStyle(ButtonStyle.Danger)
            .setEmoji('🔨')
        );
      
      await interaction.reply({ embeds: [banSuccessEmbed], components: [row] });
      
      // Log to mod log channel
      const logChannel = interaction.guild.channels.cache.find(ch => 
        ch.name === 'mod-logs' || ch.name === 'moderation-logs'
      );
      
      if (logChannel) {
        await logChannel.send({ embeds: [banSuccessEmbed] });
      }
    } catch (error) {
      const errEmbed = errorEmbed('Ban Failed', error.message);
      await interaction.reply({ embeds: [errEmbed], ephemeral: true });
    }
  }
};