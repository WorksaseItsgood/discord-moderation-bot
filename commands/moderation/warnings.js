const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

// Warnings command - enhanced with filters, pagination, and stats
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
      return interaction.reply({
        content: user ? `✅ ${user} has no warnings!` : '📋 No warnings found.',
        ephemeral: true
      });
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
      .setTitle(user ? `⚠️ Warnings for ${user.tag}` : '⚠️ All Warnings')
      .setColor(0xffaa00)
      .setDescription(`Page ${page}/${totalPages} | Total: ${userWarnings.length}`);
    
    // Add stats if viewing all
    if (!user) {
      embed.addFields(
        { name: '📊 Total', value: String(totalWarnings), inline: true },
        { name: '✅ Active', value: String(activeWarnings), inline: true },
        { name: '❌ Expired', value: String(expiredWarnings), inline: true }
      );
    }
    
    for (const warning of pageWarnings) {
      const date = new Date(warning.timestamp).toLocaleDateString();
      const status = warning.expiresAt && warning.expiresAt < now ? '⏳ Expired' : '⚠️ Active';
      
      embed.addFields({
        name: `${status} #${warning.id}`,
        value: `**User:** <@${warning.userId}>\n**Reason:** ${warning.reason}\n**By:** ${warning.moderator}\n**Date:** ${date}`,
        inline: false
      });
    }
    
    await interaction.reply({ embeds: [embed] });
  }
};