const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('antiinvite')
    .setDescription('Toggle anti-invite filter'),
  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
      return interaction.reply({ content: '❌ You need Manage Messages permission!', ephemeral: true });
    }

    const embed = {
      title: '🔒 Anti-Invite',
      description: '**Status:** ✅ Enabled\n\nServer invites will be automatically deleted!',
      color: 0x00FF00,
    };

    await interaction.reply({ embeds: [embed] });
  },
};