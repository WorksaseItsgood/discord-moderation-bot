const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('massrole')
    .setDescription('Add a role to all members')
    .addRoleOption(option =>
      option.setName('role')
        .setDescription('Role to add to all members')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('filter')
        .setDescription('Filter members')
        .setChoices(
          { name: 'all', value: 'all' },
          { name: 'no-role', value: 'no-role' },
          { name: 'has-role', value: 'has-role' }
        )),
  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageRoles)) {
      return interaction.reply({ content: '❌ You need Manage Roles permission!', ephemeral: true });
    }

    const role = interaction.options.getRole('role');
    const filter = interaction.options.getString('filter') || 'all';
    const guild = interaction.guild;
    const members = await guild.members.fetch();

    let added = 0;
    const botMember = await guild.members.fetchMe();

    for (const [id, member] of members) {
      if (member.user.bot) continue;
      if (!botMember.permissions.has(PermissionFlagsBits.ManageRoles)) continue;
      if (role.position >= botMember.roles.highest.position) continue;

      const hasRole = member.roles.cache.has(role.id);

      if (filter === 'no-role' && hasRole) continue;
      if (filter === 'has-role' && !hasRole) continue;

      try {
        await member.roles.add(role);
        added++;
      } catch (e) {
        console.log(e);
      }
    }

    await interaction.reply({ content: `✅ Added role \`${role.name}\` to ${added} members!`, ephemeral: true });
  },
};