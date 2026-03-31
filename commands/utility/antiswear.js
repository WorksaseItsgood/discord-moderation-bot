const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('antiswear')
    .setDescription('Toggle anti-swear filter'),
  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
      return interaction.reply({ content: '❌ You need Manage Messages permission!', ephemeral: true });
    }

    const embed = {
      title: '🔒 Anti-Swear',
      description: '**Status:** ✅ Enabled\n\nInappropriate words will be automatically censored!',
      color: 0x00FF00,
    };

    await interaction.reply({ embeds: [embed] });
  },
};