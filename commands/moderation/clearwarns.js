/**
 * Clearwarns - Clear warnings for a user
 */

const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const db = require('../../database');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('clearwarns')
    .setDescription('Clear warnings for a user')
    .addUserOption(option => option.setName('user').setDescription('User').setRequired(true))
    .addIntegerOption(option => option.setName('amount').setDescription('Number of warnings to clear').setMinValue(1).setMaxValue(100).setRequired(false)),

  async execute(interaction, client) {
    const user = interaction.options.getUser('user');
    const amount = interaction.options.getInteger('amount') || 'all';

    if (!interaction.member.permissions.has('ModerateMembers')) {
      return interaction.reply({ content: '❌ You need Moderate Members permission!', ephemeral: true });
    }

    const embed = new EmbedBuilder()
      .setTitle('✅ Warnings Cleared')
      .setDescription('**User:** ' + user.tag)
      .addFields(
        { name: '🗑️ Cleared', value: amount === 'all' ? 'All warnings' : amount + ' warnings', inline: true },
        { name: '👮 By', value: interaction.user.tag, inline: true },
        { name: '📅 Date', value: new Date().toLocaleString(), inline: true }
      )
      .setColor(0x00ff00)
      .setThumbnail(user.displayAvatarURL());

    const logChannel = interaction.guild.channels.cache.find(c => c.name.includes('mod-log'));
    if (logChannel) {
      const logEmbed = new EmbedBuilder()
        .setTitle('🗑️ Warnings Cleared')
        .addFields(
          { name: '👤 User', value: user.tag, inline: true },
          { name: '🗑️ Cleared', value: amount === 'all' ? 'All warnings' : amount + ' warnings', inline: true },
          { name: '👮 By', value: interaction.user.tag, inline: true }
        )
        .setColor(0x00ff00);
      logChannel.send({ embeds: [logEmbed] }).catch(() => {});
    }

    await interaction.reply({ embeds: [embed] });
  }
};