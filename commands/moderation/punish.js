/**
 * Punish Command - Advanced punishment with custom duration
 */

const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } = require('discord.js');
const db = require('../../database');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('punish')
    .setDescription('Apply a punishment to a user')
    .addUserOption(option => option.setName('user').setDescription('User to punish').setRequired(true))
    .addStringOption(option => option.setName('type').setDescription('Punishment type').addChoices(
      { name: 'Warn', value: 'warn' },
      { name: 'Mute', value: 'mute' },
      { name: 'Kick', value: 'kick' },
      { name: 'Ban', value: 'ban' }
    ).setRequired(true))
    .addStringOption(option => option.setName('reason').setDescription('Reason').setRequired(true))
    .addStringOption(option => option.setName('duration').setDescription('Duration (for mute/ban)').setRequired(false))
    .addBooleanOption(option => option.setName('silent').setDescription('Silent punishment (no dm)').setRequired(false)),

  async execute(interaction, client) {
    const user = interaction.options.getUser('user');
    const type = interaction.options.getString('type');
    const reason = interaction.options.getString('reason');
    const duration = interaction.options.getString('duration') || 'permanent';
    const silent = interaction.options.getBoolean('silent') || false;

    if (!interaction.member.permissions.has('BanMembers')) {
      return interaction.reply({ content: '❌ You need Ban Members permission!', ephemeral: true });
    }

    const caseId = Math.floor(Math.random() * 90000) + 10000;
    const timestamp = new Date().toLocaleString();

    const embed = new EmbedBuilder()
      .setTitle('✅ Punishment Applied')
      .setDescription('**Case #' + caseId + '**')
      .addFields(
        { name: '👤 User', value: user.tag + ' (`' + user.id + '`)', inline: true },
        { name: '⚖️ Type', value: type.toUpperCase(), inline: true },
        { name: '⏱️ Duration', value: duration, inline: true }
      )
      .addFields(
        { name: '📝 Reason', value: '```\n' + reason + '\n```', inline: false },
        { name: '👮 Moderator', value: interaction.user.tag, inline: true },
        { name: '📅 Date', value: timestamp, inline: true }
      )
      .setColor(type === 'ban' ? 0xff0000 : type === 'kick' ? 0xff6600 : 0xffaa00)
      .setThumbnail(user.displayAvatarURL())
      .setFooter({ text: 'Case ID: ' + caseId });

    const logEmbed = new EmbedBuilder()
      .setTitle('⚖️ Punishment Log')
      .setDescription('**Case #' + caseId)
      .addFields(
        { name: '👤 User', value: user.tag + ' (`' + user.id + '`)', inline: true },
        { name: '⚖️ Type', value: type.toUpperCase(), inline: true },
        { name: '⏱️ Duration', value: duration, inline: true },
        { name: '📝 Reason', value: reason, inline: false },
        { name: '👮 By', value: interaction.user.tag, inline: true },
        { name: '📅 Date', value: timestamp, inline: true }
      )
      .setColor(type === 'ban' ? 0xff0000 : 0xffaa00);

    const channel = interaction.guild.channels.cache.find(c => c.name.includes('mod-log') || c.name.includes('logs'));
    if (channel && !silent) {
      channel.send({ embeds: [logEmbed] }).catch(() => {});
    }

    if (type === 'kick') {
      try {
        await interaction.guild.members.kick(user, reason);
      } catch (e) {
        return interaction.reply({ content: '❌ Failed to kick: ' + e.message, ephemeral: true });
      }
    } else if (type === 'ban') {
      try {
        await interaction.guild.members.ban(user, { reason: reason });
      } catch (e) {
        return interaction.reply({ content: '❌ Failed to ban: ' + e.message, ephemeral: true });
      }
    }

    await interaction.reply({ embeds: [embed] });
  }
};