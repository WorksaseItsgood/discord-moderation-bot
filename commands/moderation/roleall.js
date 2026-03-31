/**
 * Roleall - Add role to all members
 */

const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('roleall')
    .setDescription('Add a role to all members')
    .addRoleOption(option => option.setName('role').setDescription('Role to add').setRequired(true))
    .addStringOption(option => option.setName('filter').setDescription('Filter').addChoices(
      { name: 'All Members', value: 'all' },
      { name: 'Bots Only', value: 'bots' },
      { name: 'Humans Only', value: 'humans' }
    ).setRequired(false)),

  async execute(interaction, client) {
    const role = interaction.options.getRole('role');
    const filter = interaction.options.getString('filter') || 'all';

    if (!interaction.member.permissions.has('ManageRoles')) {
      return interaction.reply({ content: '❌ You need Manage Roles permission!', ephemeral: true });
    }

    const members = interaction.guild.members.cache;
    let count = 0;

    for (const [id, member] of members) {
      if (filter === 'bots' && !member.user.bot) continue;
      if (filter === 'humans' && member.user.bot) continue;
      try {
        member.roles.add(role);
        count++;
      } catch (e) {}
    }

    const embed = new EmbedBuilder()
      .setTitle('✅ Role Added to All')
      .addFields(
        { name: '📋 Role', value: role.name, inline: true },
        { name: '👥 Affected', value: count + ' members', inline: true },
        { name: '🛡️ Filter', value: filter, inline: true }
      )
      .setColor(0x00ff00);

    await interaction.reply({ embeds: [embed] });
  }
};