/**
 * Enhanced Kick Command with reason
 */

const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('kick')
    .setDescription('Kick a user from the server')
    .addUserOption(option => option.setName('user').setDescription('User to kick').setRequired(true))
    .addStringOption(option => option.setName('reason').setDescription('Reason for kick').setRequired(false))
    .addBooleanOption(option => option.setName('soft').setDescription('Soft ban (can rejoin)').setRequired(false)),

  async execute(interaction, client) {
    const user = interaction.options.getUser('user');
    const reason = interaction.options.getString('reason') || 'No reason provided';
    const soft = interaction.options.getBoolean('soft') || false;

    if (!interaction.member.permissions.has('KickMembers')) {
      return interaction.reply({ content: '❌ You need Kick Members permission!', ephemeral: true });
    }

    const member = interaction.guild.members.cache.get(user.id);
    if (!member) {
      return interaction.reply({ content: '❌ User not found in server!', ephemeral: true });
    }

    const caseId = Math.floor(Math.random() * 90000) + 10000;

    try {
      await member.kick(reason);

      if (soft) {
        const embed = new EmbedBuilder()
          .setTitle('👢 User Soft Banned')
          .setDescription('**Case #' + caseId + '**\nUser can rejoin with invite')
          .addFields(
            { name: '👤 User', value: user.tag + ' (`' + user.id + '`)', inline: true },
            { name: '📝 Reason', value: reason, inline: true },
            { name: '👮 By', value: interaction.user.tag, inline: true }
          )
          .setColor(0xff6600)
          .setThumbnail(user.displayAvatarURL());
        return interaction.reply({ embeds: [embed] });
      }

      const embed = new EmbedBuilder()
        .setTitle('👢 User Kicked')
        .setDescription('**Case #' + caseId + '**')
        .addFields(
          { name: '👤 User', value: user.tag + ' (`' + user.id + '`)', inline: true },
          { name: '📝 Reason', value: reason, inline: true },
          { name: '👮 Moderator', value: interaction.user.tag, inline: true },
          { name: '📅 Date', value: new Date().toLocaleString(), inline: true }
        )
        .setColor(0xff6600)
        .setThumbnail(user.displayAvatarURL());

      const logChannel = interaction.guild.channels.cache.find(c => c.name.includes('mod-log'));
      if (logChannel) {
        logChannel.send({ embeds: [embed] }).catch(() => {});
      }

      await interaction.reply({ embeds: [embed] });
    } catch (e) {
      await interaction.reply({ content: '❌ Failed to kick: ' + e.message, ephemeral: true });
    }
  }
};