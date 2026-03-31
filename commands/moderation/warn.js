const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { defaultConfig } = require('../../config');

// Warn command
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
    
    // Add new warning
    const warning = {
      id: guildWarnings.length + 1,
      userId: user.id,
      userTag: user.tag,
      reason: reason,
      moderator: interaction.user.tag,
      timestamp: Date.now(),
      expiresAt: Date.now() + (defaultConfig.moderation?.warnExpiryDays || 30) * 24 * 60 * 60 * 1000
    };
    
    guildWarnings.push(warning);
    client.warnings.set(interaction.guild.id, guildWarnings);
    
    console.log(`[Warn] ${user.tag} warned in ${interaction.guild.name}. Reason: ${reason}`);
    
    // DM user if enabled
    if (dmOnAction) {
      const dmEmbed = new EmbedBuilder()
        .setTitle('⚠️ You have been warned')
        .setColor(0xffaa00)
        .addFields(
          { name: 'Server', value: interaction.guild.name },
          { name: 'Reason', value: reason },
          { name: 'Total Warnings', value: String(userWarnings.length + 1) }
        );
      
      try {
        await user.send({ embeds: [dmEmbed] });
      } catch (error) {
        console.log(`[Warn] Could not DM user ${user.tag}: ${error.message}`);
      }
    }
    
    const embed = new EmbedBuilder()
      .setTitle('⚠️ User Warned')
      .setColor(0xffaa00)
      .addFields(
        { name: 'User', value: `${user} (${user.id})`, inline: true },
        { name: 'Reason', value: reason, inline: true },
        { name: 'Total Warnings', value: String(userWarnings.length + 1), inline: true }
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