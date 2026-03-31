const { SlashCommandBuilder, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const { modAction, success, error: errorEmbed, COLOR } = require('../../utils/embedTemplates');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('clearwarns')
    .setDescription('Clear all warnings for a user')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('User to clear warnings for')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('Reason for clearing warnings')
        .setRequired(false)),
  permissions: [PermissionFlagsBits.ModerateMembers],
  async execute(interaction, client) {
    const user = interaction.options.getUser('user');
    const reason = interaction.options.getString('reason') || 'No reason provided';
    
    const guildWarnings = client.warnings?.get(interaction.guild.id) || [];
    const userWarnings = guildWarnings.filter(w => w.userId === user.id);
    const warningCount = userWarnings.length;
    
    if (warningCount === 0) {
      const noWarnEmbed = success('No Warnings', `${user.tag} has no warnings to clear!`);
      return interaction.reply({ embeds: [noWarnEmbed], ephemeral: true });
    }
    
    // Remove user's warnings
    const updatedWarnings = guildWarnings.filter(w => w.userId !== user.id);
    client.warnings.set(interaction.guild.id, updatedWarnings);
    
    console.log(`[Clearwarns] Cleared ${warningCount} warnings for ${user.tag} in ${interaction.guild.name}`);
    
    const embed = new EmbedBuilder()
      .setColor(COLOR.SUCCESS)
      .setTitle('✅ Warnings Cleared')
      .setDescription(`${warningCount} warning(s) cleared for ${user.tag}`)
      .addFields(
        { name: 'User', value: user.toString(), inline: true },
        { name: 'Moderator', value: interaction.user.toString(), inline: true },
        { name: 'Warnings Cleared', value: String(warningCount), inline: true },
        { name: 'Reason', value: reason, inline: false }
      )
      .setFooter({ text: 'Niotic Moderation • ' + new Date().toLocaleDateString() })
      .setTimestamp();
    
    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId(`clearwarns_undo_${user.id}`)
          .setLabel('View User')
          .setStyle(ButtonStyle.Secondary)
          .setEmoji('👤')
      );
    
    await interaction.reply({ embeds: [embed], components: [row] });
    
    // Log to mod log channel
    const logChannel = interaction.guild.channels.cache.find(ch => 
      ch.name === 'mod-logs' || ch.name === 'moderation-logs'
    );
    
    if (logChannel) {
      await logChannel.send({ embeds: [embed] });
    }
  }
};