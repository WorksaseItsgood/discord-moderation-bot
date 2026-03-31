/**
 * Enhanced Mute Command with duration buttons
 */

const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } = require('discord.js');
const db = require('../../database');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('mute')
    .setDescription('Mute a user')
    .addUserOption(option => option.setName('user').setDescription('User to mute').setRequired(true))
    .addStringOption(option => option.setName('reason').setDescription('Reason').setRequired(false))
    .addBooleanOption(option => option.setName('silent').setDescription('Silent mute (no message)').setRequired(false)),

  async execute(interaction, client) {
    const user = interaction.options.getUser('user');
    const reason = interaction.options.getString('reason') || 'No reason provided';
    const silent = interaction.options.getBoolean('silent') || false;

    if (!interaction.member.permissions.has('ModerateMembers')) {
      return interaction.reply({ content: '❌ You need Moderate Members permission!', ephemeral: true });
    }

    const member = interaction.guild.members.cache.get(user.id);
    if (!member) {
      return interaction.reply({ content: '❌ User not found in server!', ephemeral: true });
    }

    const caseId = Math.floor(Math.random() * 90000) + 10000;
    const muteRole = interaction.guild.roles.cache.find(r => r.name.toLowerCase().includes('muted')) || 
      interaction.guild.roles.cache.find(r => r.name.toLowerCase().includes('mute'));

    if (muteRole) {
      member.roles.add(muteRole).catch(() => {});
    }

    const embed = new EmbedBuilder()
      .setTitle('🔇 User Muted')
      .setDescription('**Case #' + caseId + '**')
      .addFields(
        { name: '👤 User', value: user.tag + ' (`' + user.id + '`)', inline: true },
        { name: '⏱️ Duration', value: 'Permanent', inline: true },
        { name: '📝 Reason', value: '```\n' + reason + '\n```', inline: false }
      )
      .addFields(
        { name: '👮 Moderator', value: interaction.user.tag, inline: true },
        { name: '📅 Date', value: new Date().toLocaleString(), inline: true }
      )
      .setColor(0xffaa00)
      .setThumbnail(user.displayAvatarURL());

    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder().setCustomId('unmute_' + user.id).setLabel('🔊 Unmute').setStyle(ButtonStyle.Success),
        new ButtonBuilder().setCustomId('muteExtend_' + user.id).setLabel('⏱️ Extend').setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId('muteInfo_' + user.id).setLabel('ℹ️ Info').setStyle(ButtonStyle.Secondary)
      );

    if (!silent) {
      user.send({ content: '🔇 You have been muted in ' + interaction.guild.name + '\n**Reason:** ' + reason }).catch(() => {});
    }

    const logChannel = interaction.guild.channels.cache.find(c => c.name.includes('mod-log'));
    if (logChannel) {
      logChannel.send({ embeds: [embed] }).catch(() => {});
    }

    await interaction.reply({ embeds: [embed], components: [row] });
  }
};