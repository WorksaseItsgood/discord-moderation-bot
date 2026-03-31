const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('maxmentions')
    .setDescription('Set max mentions')
    .addIntegerOption(option =>
      option.setName('count')
        .setDescription('Max mentions per message')
        .setRequired(true)),
  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
      return interaction.reply({ content: '❌ You need Manage Messages permission!', ephemeral: true });
    }

    const count = interaction.options.getInteger('count');

    const embed = {
      title: '📢 Max Mentions',
      description: `**Max mentions:** ${count}\n\nMessages with more than ${count} mentions will be deleted!`,
      color: 0x00FF00,
    };

    await interaction.reply({ embeds: [embed] });
  },
};