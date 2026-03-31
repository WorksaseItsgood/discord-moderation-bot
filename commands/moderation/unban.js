/**
 * Unban Command
 */

const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('unban')
    .setDescription('Unban a user')
    .addUserOption(option => option.setName('user').setDescription('User to unban').setRequired(true))
    .addStringOption(option => option.setName('reason').setDescription('Reason').setRequired(false)),

  async execute(interaction, client) {
    const user = interaction.options.getUser('user');
    const reason = interaction.options.getString('reason') || 'Unban requested';

    if (!interaction.member.permissions.has('BanMembers')) {
      return interaction.reply({ content: '❌ You need Ban Members permission!', ephemeral: true });
    }

    try {
      await interaction.guild.bans.remove(user.id);
    } catch (e) {
      return interaction.reply({ content: '❌ User not banned or error: ' + e.message, ephemeral: true });
    }

    const embed = new EmbedBuilder()
      .setTitle('✅ User Unbanned')
      .addFields(
        { name: '👤 User', value: user.tag, inline: true },
        { name: '📝 Reason', value: reason, inline: true },
        { name: '👮 By', value: interaction.user.tag, inline: true }
      )
      .setColor(0x00ff00);

    user.send({ content: '✅ You have been unbanned from ' + interaction.guild.name }).catch(() => {});

    await interaction.reply({ embeds: [embed] });
  }
};