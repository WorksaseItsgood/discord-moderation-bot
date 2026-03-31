const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { warning, info, COLOR } = require('../../utils/embedTemplates');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('warnings')
    .setDescription('View warnings (enhanced)')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('User to check warnings for')
        .setRequired(false))
    .addIntegerOption(option =>
      option.setName('page')
        .setDescription('Page number')
        .setMinValue(1)
        .setRequired(false))
    .addBooleanOption(option =>
      option.setName('show_expired')
        .setDescription('Show expired warnings')
        .setRequired(false)),
  permissions: [PermissionFlagsBits.ModerateMembers],
  async execute(interaction, client) {
    const user = interaction.options.getUser('user');
    const page = interaction.options.getInteger('page') || 1;
    const showExpired = interaction.options.getBoolean('show_expired') || false;
    
    const guildWarnings = client.warnings?.get(interaction.guild.id) || [];
    const now = Date.now();
    
    // Filter warnings
    let userWarnings = guildWarnings.filter(w => {
      if (user && w.userId !== user.id) return false;
      if (!showExpired && w.expiresAt && w.expiresAt < now) return false;
      return true;
    });
    
    if (userWarnings.length === 0) {
      const noWarnEmbed = user 
        ? info('No Warnings', `${user} has no warnings!`)
        : info('No Warnings', 'No warnings found in this server.');
      return interaction.reply({ embeds: [noWarnEmbed], ephemeral: true });
    }
    
    // Sort by timestamp descending
    userWarnings.sort((a, b) => b.timestamp - a.timestamp);
    
    const warningsPerPage = 5;
    const totalPages = Math.ceil(userWarnings.length / warningsPerPage);
    const start = (page - 1) * warningsPerPage;
    const end = start + warningsPerPage;
    const pageWarnings = userWarnings.slice(start, end);
    
    // Calculate stats
    const totalWarnings = guildWarnings.length;
    const activeWarnings = guildWarnings.filter(w => !w.expiresAt || w.expiresAt > now).length;
    const expiredWarnings = totalWarnings - activeWarnings;
    
    const embed = new EmbedBuilder()
      .setColor(COLOR.WARNING)
      .setTitle(user ? `⚠️ Warnings for ${user.tag}` : '⚠️ All Warnings')
      .setDescription(`Page ${page}/${totalPages} | Total: ${userWarnings.length} warning(s)`);
    
    // Add stats if viewing all
    if (!user) {
      embed.addFields(
        { name: '📊 Total', value: String(totalWarnings), inline: true },
        { name: '✅ Active', value: String(activeWarnings), inline: true },
        { name: '⏳ Expired', value: String(expiredWarnings), inline: true }
      );
    }
    
    for (const warn of pageWarnings) {
      const date = new Date(warn.timestamp).toLocaleDateString();
      const status = warn.expiresAt && warn.expiresAt < now ? '⏳' : '⚠️';
      
      embed.addFields({
        name: `${status} Warning #${warn.id}`,
        value: `**User:** <@${warn.userId}>\n**Reason:** ${warn.reason}\n**By:** ${warn.moderator}\n**Date:** ${date}`,
        inline: false
      });
    }
    
    // Add navigation buttons
    const row = new ActionRowBuilder();
    
    if (totalPages > 1) {
      row.addComponents(
        new ButtonBuilder()
          .setCustomId(`warnings_prev_${page}`)
          .setLabel('◀')
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(page === 1),
        new ButtonBuilder()
          .setCustomId(`warnings_page_${page}`)
          .setLabel(`${page}/${totalPages}`)
          .setStyle(ButtonStyle.Primary)
          .setDisabled(true),
        new ButtonBuilder()
          .setCustomId(`warnings_next_${page}`)
          .setLabel('▶')
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(page === totalPages)
      );
    }
    
    await interaction.reply({ embeds: [embed], components: totalPages > 1 ? [row] : [], ephemeral: true });
  }
};