const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('massdm')
    .setDescription('DM all members with a message')
    .addStringOption(option =>
      option.setName('message')
        .setDescription('Message to send')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('filter')
        .setDescription('Filter members')
        .addStringChoice('all', 'all')
        .addStringChoice('no-role', 'no-role')
        .addStringChoice('has-role', 'has-role'))
    .addRoleOption(option =>
      option.setName('role')
        .setDescription('Role to filter by')),
  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
      return interaction.reply({ content: '❌ You need Manage Messages permission!', ephemeral: true });
    }

    const message = interaction.options.getString('message');
    const filter = interaction.options.getString('filter') || 'all';
    const role = interaction.options.getRole('role');
    const guild = interaction.guild;
    const members = await guild.members.fetch();

    let sent = 0;
    let failed = 0;

    for (const [id, member] of members) {
      if (member.user.bot) continue;
      if (!member.sendable) continue;

      if (filter === 'no-role' && role && member.roles.cache.has(role.id)) continue;
      if (filter === 'has-role' && role && !member.roles.cache.has(role.id)) continue;

      try {
        await member.send(message);
        sent++;
      } catch (e) {
        failed++;
      }
    }

    await interaction.reply({ content: `✅ Sent DM to ${sent} members! Failed: ${failed}`, ephemeral: true });
  },
};