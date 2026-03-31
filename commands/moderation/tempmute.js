/**
 * Tempmute - Temporary mute with duration menu
 */

const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('tempmute')
    .setDescription('Temporary mute with duration')
    .addUserOption(option => option.setName('user').setDescription('User to mute').setRequired(true))
    .addStringOption(option => option.setName('duration').setDescription('Duration').addChoices(
      { name: '5 minutes', value: '5m' },
      { name: '15 minutes', value: '15m' },
      { name: '30 minutes', value: '30m' },
      { name: '1 hour', value: '1h' },
      { name: '6 hours', value: '6h' },
      { name: '12 hours', value: '12h' },
      { name: '1 day', value: '1d' },
      { name: '3 days', value: '3d' },
      { name: '7 days', value: '7d' }
    ).setRequired(true))
    .addStringOption(option => option.setName('reason').setDescription('Reason').setRequired(false)),

  async execute(interaction, client) {
    const user = interaction.options.getUser('user');
    const duration = interaction.options.getString('duration');
    const reason = interaction.options.getString('reason') || 'No reason provided';

    if (!interaction.member.permissions.has('ModerateMembers')) {
      return interaction.reply({ content: '❌ You need Moderate Members permission!', ephemeral: true });
    }

    const durations = { '5m': '5 minutes', '15m': '15 minutes', '30m': '30 minutes', '1h': '1 hour', '6h': '6 hours', '12h': '12 hours', '1d': '1 day', '3d': '3 days', '7d': '7 days' };
    const caseId = Math.floor(Math.random() * 90000) + 10000;

    const member = interaction.guild.members.cache.get(user.id);
    const muteRole = interaction.guild.roles.cache.find(r => r.name.toLowerCase().includes('muted'));

    if (member && muteRole) {
      member.roles.add(muteRole).catch(() => {});
    }

    const embed = new EmbedBuilder()
      .setTitle('🔇 User Temporary Muted')
      .setDescription('**Case #' + caseId + '**')
      .addFields(
        { name: '👤 User', value: user.tag, inline: true },
        { name: '⏱️ Duration', value: durations[duration], inline: true },
        { name: '📝 Reason', value: reason, inline: false }
      )
      .setColor(0xff6600)
      .setThumbnail(user.displayAvatarURL());

    await interaction.reply({ embeds: [embed] });
  }
};