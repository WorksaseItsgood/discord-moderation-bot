/**
 * Enhanced Ban Command with reason menu
 */

const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ban')
    .setDescription('Ban a user from the server')
    .addUserOption(option => option.setName('user').setDescription('User to ban').setRequired(true))
    .addStringOption(option => option.setName('reason').setDescription('Reason for ban').addChoices(
      { name: 'Spam/Advertising', value: 'Spam/Advertising' },
      { name: 'Harassment/Bullying', value: 'Harassment/Bullying' },
      { name: 'NSFW/Explicit', value: 'NSFW/Explicit' },
      { name: 'Raiding', value: 'Raiding' },
      { name: 'Impersonation', value: 'Impersonation' },
      { name: 'Breaking Rules', value: 'Breaking Server Rules' },
      { name: 'Other', value: 'Other' }
    ).setRequired(false))
    .addStringOption(option => option.setName('evidence').setDescription('Evidence URL').setRequired(false))
    .addBooleanOption(option => option.setName('silent').setDescription('Silent ban (no message)').setRequired(false)),

  async execute(interaction, client) {
    const user = interaction.options.getUser('user');
    const reason = interaction.options.getString('reason') || 'Breaking server rules';
    const evidence = interaction.options.getString('evidence');
    const silent = interaction.options.getBoolean('silent') || false;

    if (!interaction.member.permissions.has('BanMembers')) {
      return interaction.reply({ content: '❌ You need Ban Members permission!', ephemeral: true });
    }

    const member = interaction.guild.members.cache.get(user.id);
    if (member) {
      try {
        await member.ban({ reason: reason });
      } catch (e) {
        return interaction.reply({ content: '❌ Failed to ban: ' + e.message, ephemeral: true });
      }
    }

    const caseId = Math.floor(Math.random() * 90000) + 10000;

    const embed = new EmbedBuilder()
      .setTitle('🚫 User Banned')
      .setDescription('**Case #' + caseId + '**')
      .addFields(
        { name: '👤 User', value: user.tag + ' (`' + user.id + '`)', inline: true },
        { name: '⚖️ Reason', value: reason, inline: true },
        { name: '📎 Evidence', value: evidence || 'None provided', inline: false }
      )
      .addFields(
        { name: '👮 Moderator', value: interaction.user.tag, inline: true },
        { name: '📅 Date', value: new Date().toLocaleString(), inline: true }
      )
      .setColor(0xff0000)
      .setThumbnail(user.displayAvatarURL());

    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder().setCustomId('unban_' + user.id).setLabel('✅ Unban').setStyle(ButtonStyle.Success),
        new ButtonBuilder().setCustomId('banInfo_' + user.id).setLabel('ℹ️ Ban Info').setStyle(ButtonStyle.Secondary)
      );

    const logChannel = interaction.guild.channels.cache.find(c => c.name.includes('mod-log'));
    if (logChannel) {
      logChannel.send({ embeds: [embed] }).catch(() => {});
    }

    await interaction.reply({ embeds: [embed], components: [row] });
  }
};