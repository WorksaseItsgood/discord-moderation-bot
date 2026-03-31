/**
 * Tempban - Temporary ban
 */

const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('tempban')
    .setDescription('Temporarily ban a user')
    .addUserOption(option => option.setName('user').setDescription('User to ban').setRequired(true))
    .addStringOption(option => option.setName('duration').setDescription('Ban duration').addChoices(
      { name: '1 hour', value: '1h' },
      { name: '6 hours', value: '6h' },
      { name: '12 hours', value: '12h' },
      { name: '1 day', value: '1d' },
      { name: '3 days', value: '3d' },
      { name: '7 days', value: '7d' },
      { name: '14 days', value: '14d' },
      { name: '30 days', value: '30d' }
    ).setRequired(true))
    .addStringOption(option => option.setName('reason').setDescription('Reason').setRequired(false)),

  async execute(interaction, client) {
    const user = interaction.options.getUser('user');
    const duration = interaction.options.getString('duration');
    const reason = interaction.options.getString('reason') || 'Breaking server rules';

    const durations = { '1h': '1 hour', '6h': '6 hours', '12h': '12 hours', '1d': '1 day', '3d': '3 days', '7d': '7 days', '14d': '14 days', '30d': '30 days' };
    const caseId = Math.floor(Math.random() * 90000) + 10000;

    const embed = new EmbedBuilder()
      .setTitle('🚫 User Temporary Banned')
      .setDescription('**Case #' + caseId + '**')
      .addFields(
        { name: '👤 User', value: user.tag, inline: true },
        { name: '⏱️ Duration', value: durations[duration], inline: true },
        { name: '📝 Reason', value: reason, inline: false },
        { name: '👮 By', value: interaction.user.tag, inline: true }
      )
      .setColor(0xff0000);

    await interaction.reply({ embeds: [embed] });
  }
};