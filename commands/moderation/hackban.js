/**
 * Hackban - Ban by ID
 */

const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('hackban')
    .setDescription('Ban a user by ID (not in server)')
    .addStringOption(option => option.setName('userid').setDescription('User ID').setRequired(true))
    .addStringOption(option => option.setName('reason').setDescription('Reason').setRequired(false)),

  async execute(interaction, client) {
    const userId = interaction.options.getString('userid');
    const reason = interaction.options.getString('reason') || 'Breaking server rules';

    if (!interaction.member.permissions.has('BanMembers')) {
      return interaction.reply({ content: '❌ You need Ban Members permission!', ephemeral: true });
    }

    try {
      await interaction.guild.bans.create(userId, { reason: reason });
    } catch (e) {
      return interaction.reply({ content: '❌ Failed to ban: ' + e.message, ephemeral: true });
    }

    const caseId = Math.floor(Math.random() * 90000) + 10000;

    const embed = new EmbedBuilder()
      .setTitle('🚫 User Hackbanned')
      .setDescription('**Case #' + caseId + '**')
      .addFields(
        { name: '🆔 User ID', value: '`' + userId + '`', inline: true },
        { name: '📝 Reason', value: reason, inline: true },
        { name: '👮 By', value: interaction.user.tag, inline: true }
      )
      .setColor(0xff0000);

    await interaction.reply({ embeds: [embed] });
  }
};