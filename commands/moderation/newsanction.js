/**
 * Newsanction - Create custom sanction/punishment
 */

const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('newsanction')
    .setDescription('Create a custom sanction')
    .addUserOption(option => option.setName('user').setDescription('User').setRequired(true))
    .addStringOption(option => option.setName('sanctiontype').setDescription('Sanction type').addChoices(
      { name: 'Verbal Warning', value: 'verbal' },
      { name: 'Formal Warning', value: 'formal' },
      { name: 'Final Warning', value: 'final' },
      { name: 'Temporary Mute', value: 'tempmute' },
      { name: 'Permanent Mute', value: 'permmute' },
      { name: 'Temporary Ban', value: 'tempban' },
      { name: 'Permanent Ban', value: 'permban' },
      { name: 'Custom', value: 'custom' }
    ).setRequired(true))
    .addStringOption(option => option.setName('reason').setDescription('Reason').setRequired(true))
    .addStringOption(option => option.setName('duration').setDescription('Duration (e.g., 7d, 24h)').setRequired(false))
    .addStringOption(option => option.setName('evidence').setDescription('Evidence/links').setRequired(false)),

  async execute(interaction, client) {
    const user = interaction.options.getUser('user');
    const sanctionType = interaction.options.getString('sanctiontype');
    const reason = interaction.options.getString('reason');
    const duration = interaction.options.getString('duration');
    const evidence = interaction.options.getString('evidence');

    if (!interaction.member.permissions.has('ModerateMembers')) {
      return interaction.reply({ content: '❌ You need Moderate Members permission!', ephemeral: true });
    }

    const caseNumber = Math.floor(Math.random() * 90000) + 10000;
    const typeLabels = {
      verbal: '⚠️ Verbal Warning',
      formal: '📝 Formal Warning',
      final: '❗ Final Warning',
      tempmute: '🔇 Temporary Mute',
      permmute: '🔇 Permanent Mute',
      tempban: '🚫 Temporary Ban',
      permban: '🚫 Permanent Ban',
      custom: '⚡ Custom Sanction'
    };

    const embed = new EmbedBuilder()
      .setTitle('✅ Sanction Created')
      .setDescription('**Case #' + caseNumber + '**')
      .addFields(
        { name: '👤 User', value: user.tag, inline: true },
        { name: '📋 Sanction', value: typeLabels[sanctionType], inline: true },
        { name: '⏱️ Duration', value: duration || 'N/A', inline: true }
      )
      .addFields(
        { name: '📝 Reason', value: '```\n' + reason + '\n```', inline: false },
        { name: '📎 Evidence', value: evidence || 'None provided', inline: false },
        { name: '👮 Processed by', value: interaction.user.tag, inline: true }
      )
      .setColor(sanctionType.includes('ban') ? 0xff0000 : 0xff6600)
      .setThumbnail(user.displayAvatarURL());

    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder().setCustomId('sanctionAppeal_' + caseNumber).setLabel('📝 Appeal').setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId('sanctionRemove_' + caseNumber).setLabel('❌ Remove').setStyle(ButtonStyle.Danger)
      );

    await interaction.reply({ embeds: [embed], components: [row] });
  }
};