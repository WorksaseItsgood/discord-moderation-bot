/**
 * Softban - Ban and delete messages
 */

const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('softban')
    .setDescription('Ban and delete recent messages')
    .addUserOption(option => option.setName('user').setDescription('User to softban').setRequired(true))
    .addIntegerOption(option => option.setName('days').setDescription('Days of messages to delete').setMinValue(1).setMaxValue(7).setRequired(false))
    .addStringOption(option => option.setName('reason').setDescription('Reason').setRequired(false)),

  async execute(interaction, client) {
    const user = interaction.options.getUser('user');
    const days = interaction.options.getInteger('days') || 1;
    const reason = interaction.options.getString('reason') || 'Softban';

    if (!interaction.member.permissions.has('BanMembers')) {
      return interaction.reply({ content: '❌ You need Ban Members permission!', ephemeral: true });
    }

    const member = interaction.guild.members.cache.get(user.id);
    if (member) {
      try {
        await member.ban({ reason: reason, days: days });
        const bans = await interaction.guild.bans.fetch();
        const banned = bans.find(b => b.user.id === user.id);
        if (banned) {
          await interaction.guild.bans.remove(user.id);
        }
      } catch (e) {
        return interaction.reply({ content: '❌ Failed: ' + e.message, ephemeral: true });
      }
    }

    const caseId = Math.floor(Math.random() * 90000) + 10000;

    const embed = new EmbedBuilder()
      .setTitle('⚠️ User Softbanned')
      .setDescription('**Case #' + caseId + '**\nUser can rejoin with invite')
      .addFields(
        { name: '👤 User', value: user.tag, inline: true },
        { name: '🗑️ Messages Deleted', value: days + ' days', inline: true },
        { name: '📝 Reason', value: reason, inline: true }
      )
      .setColor(0xff6600);

    await interaction.reply({ embeds: [embed] });
  }
};