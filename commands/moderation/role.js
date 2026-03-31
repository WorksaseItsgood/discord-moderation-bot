/**
 * Role - Add/remove role from user
 */

const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('role')
    .setDescription('Add or remove a role from a user')
    .addUserOption(option => option.setName('user').setDescription('User').setRequired(true))
    .addRoleOption(option => option.setName('role').setDescription('Role').setRequired(true))
    .addStringOption(option => option.setName('action').setDescription('Action').addChoices(
      { name: 'Add', value: 'add' },
      { name: 'Remove', value: 'remove' }
    ).setRequired(false)),

  async execute(interaction, client) {
    const user = interaction.options.getUser('user');
    const role = interaction.options.getRole('role');
    const action = interaction.options.getString('action') || 'add';

    const member = interaction.guild.members.cache.get(user.id);
    if (!member) {
      return interaction.reply({ content: '❌ User not found!', ephemeral: true });
    }

    if (action === 'add') {
      member.roles.add(role).catch(() => {});
    } else {
      member.roles.remove(role).catch(() => {});
    }

    const embed = new EmbedBuilder()
      .setTitle(action === 'add' ? '✅ Role Added' : '❌ Role Removed')
      .addFields(
        { name: '👤 User', value: user.tag, inline: true },
        { name: '📋 Role', value: role.name, inline: true },
        { name: '👮 By', value: interaction.user.tag, inline: true }
      )
      .setColor(action === 'add' ? 0x00ff00 : 0xff0000);

    await interaction.reply({ embeds: [embed] });
  }
};