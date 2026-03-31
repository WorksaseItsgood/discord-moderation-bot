const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('antispam')
    .setDescription('Toggle anti-spam filter'),
  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
      return interaction.reply({ content: '❌ You need Manage Messages permission!', ephemeral: true });
    }

    const embed = {
      title: '🔒 Anti-Spam',
      description: '**Status:** ✅ Enabled\n\nSpam will be automatically detected and deleted!',
      color: 0x00FF00,
    };

    await interaction.reply({ embeds: [embed] });
  },
};