/**
 * Enhanced Unmute Command
 */

const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('unmute')
    .setDescription('Unmute a user')
    .addUserOption(option => option.setName('user').setDescription('User to unmute').setRequired(true))
    .addStringOption(option => option.setName('reason').setDescription('Reason').setRequired(false)),

  async execute(interaction, client) {
    const user = interaction.options.getUser('user');
    const reason = interaction.options.getString('reason') || 'Unmute requested';

    if (!interaction.member.permissions.has('ModerateMembers')) {
      return interaction.reply({ content: '❌ You need Moderate Members permission!', ephemeral: true });
    }

    const member = interaction.guild.members.cache.get(user.id);
    const muteRole = interaction.guild.roles.cache.find(r => r.name.toLowerCase().includes('muted'));

    if (member && muteRole) {
      member.roles.remove(muteRole).catch(() => {});
    }

    const embed = new EmbedBuilder()
      .setTitle('🔊 User Unmuted')
      .addFields(
        { name: '👤 User', value: user.tag, inline: true },
        { name: '📝 Reason', value: reason, inline: true },
        { name: '👮 By', value: interaction.user.tag, inline: true }
      )
      .setColor(0x00ff00)
      .setThumbnail(user.displayAvatarURL());

    user.send({ content: '🔊 You have been unmuted in ' + interaction.guild.name }).catch(() => {});

    const logChannel = interaction.guild.channels.cache.find(c => c.name.includes('mod-log'));
    if (logChannel) {
      logChannel.send({ embeds: [embed] }).catch(() => {});
    }

    await interaction.reply({ embeds: [embed] });
  }
};