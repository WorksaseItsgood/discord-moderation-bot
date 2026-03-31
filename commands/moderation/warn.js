const { SlashCommandBuilder, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { defaultConfig } = require('../../config');
const { warning, error: errorEmbed, COLOR } = require('../../utils/embedTemplates');

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
        .setRequired(false)),
  permissions: [PermissionFlagsBits.ModerateMembers],
  async execute(interaction, client) {
    const user = interaction.options.getUser('user');
    const reason = interaction.options.getString('reason') || 'No reason provided';
    
    const member = interaction.guild.members.cache.get(user.id);
    const dmOnAction = defaultConfig.moderation?.dmOnAction ?? true;
    
    // Initialize warnings storage if not exists
    if (!client.warnings) {
      client.warnings = new Map();
    }
    
    const guildWarnings = client.warnings.get(interaction.guild.id) || [];
    const userWarnings = guildWarnings.filter(w => w.userId === user.id);
    const totalWarnings = userWarnings.length + 1;
    
    // Add new warning
    const warningData = {
      id: guildWarnings.length + 1,
      userId: user.id,
      userTag: user.tag,
      reason: reason,
      moderator: interaction.user.tag,
      timestamp: Date.now(),
      expiresAt: Date.now() + (defaultConfig.moderation?.warnExpiryDays || 30) * 24 * 60 * 60 * 1000
    };
    
    guildWarnings.push(warningData);
    client.warnings.set(interaction.guild.id, guildWarnings);
    
    console.log(`[Warn] ${user.tag} warned in ${interaction.guild.name}. Reason: ${reason}`);
    
    const warnEmbed = warning('Warning Issued', user, interaction.user, reason, totalWarnings);
    
    // DM user if enabled
    if (dmOnAction) {
      const dmEmbed = new (require('discord.js').EmbedBuilder)()
        .setColor(COLOR.WARNING)
        .setTitle('⚠️ You have been warned')
        .setDescription(`You received a warning in **${interaction.guild.name}**`)
        .addFields(
          { name: 'Reason', value: reason, inline: false },
          { name: 'Total Warnings', value: String(totalWarnings), inline: true },
          { name: 'Moderator', value: interaction.user.tag, inline: true }
        )
        .setFooter({ text: 'Niotic Moderation' })
        .setTimestamp();
      
      try {
        await user.send({ embeds: [dmEmbed] });
      } catch (err) {
        console.log(`[Warn] Could not DM user ${user.tag}: ${err.message}`);
      }
    }
    
    // Add action buttons
    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId(`warn_view_${user.id}`)
          .setLabel('View Warnings')
          .setStyle(ButtonStyle.Secondary)
          .setEmoji('📋'),
        new ButtonBuilder()
          .setCustomId(`warn_clear_${user.id}`)
          .setLabel('Clear Warnings')
          .setStyle(ButtonStyle.Danger)
          .setEmoji('🗑️')
      );
    
    await interaction.reply({ embeds: [warnEmbed], components: [row] });
    
    // Log to mod log channel
    const logChannel = interaction.guild.channels.cache.find(ch => 
      ch.name === 'mod-logs' || ch.name === 'moderation-logs'
    );
    
    if (logChannel) {
      await logChannel.send({ embeds: [warnEmbed] });
    }
  }
};