const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

// Warnhistory command - Full warning history
module.exports = {
  data: new SlashCommandBuilder()
    .setName('warnhistory')
    .setDescription('View full warning history for a user')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('User to view warnings for')
        .setRequired(false)),
  permissions: [PermissionFlagsBits.ModerateMembers],
  async execute(interaction, client) {
    const user = interaction.options.getUser('user');
    const targetUser = user || interaction.user;
    
    if (!client.warnings) {
      client.warnings = new Map();
    }
    
    const guildWarnings = client.warnings.get(interaction.guild.id) || [];
    const userWarnings = guildWarnings.filter(w => w.userId === targetUser.id);
    
    if (userWarnings.length === 0) {
      return interaction.reply({ 
        content: `✅ ${targetUser} has no warning history!`,
        ephemeral: true 
      });
    }
    
    // Sort by timestamp (newest first)
    userWarnings.sort((a, b) => b.timestamp - a.timestamp);
    
    const embed = new EmbedBuilder()
      .setTitle(`⚠️ Warning History: ${targetUser.tag}`)
      .setColor(0xffaa00)
      .addFields(
        { name: 'Total Warnings', value: String(userWarnings.length), inline: true },
        { name: 'User ID', value: targetUser.id, inline: true }
      );
    
    // Add warning entries (max 10 shown)
    const warningList = userWarnings.slice(0, 10).map((w, i) => {
      const date = new Date(w.timestamp).toLocaleDateString();
      const status = w.expiresAt && w.expiresAt < Date.now() ? ' (Expired)' : '';
      return `**#${userWarnings.length - i}** - ${w.reason}\n📅 ${date} by ${w.moderator}${status}`;
    }).join('\n\n');
    
    embed.addFields({ name: 'Warnings', value: warningList });
    
    if (userWarnings.length > 10) {
      embed.setFooter({ text: `Showing 10 of ${userWarnings.length} warnings` });
    }
    
    await interaction.reply({ embeds: [embed], ephemeral: true });
  }
};