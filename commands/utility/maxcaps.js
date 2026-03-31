const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('maxcaps')
    .setDescription('Set max caps percentage')
    .addIntegerOption(option =>
      option.setName('percentage')
        .setDescription('Max caps % (0-100)')
        .setRequired(true)),
  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
      return interaction.reply({ content: '❌ You need Manage Messages permission!', ephemeral: true });
    }

    const percentage = interaction.options.getInteger('percentage');

    const embed = {
      title: '🔠 Max Caps',
      description: `**Max caps:** ${percentage}%\n\nMessages with more than ${percentage}% caps will be deleted!`,
      color: 0x00FF00,
    };

    await interaction.reply({ embeds: [embed] });
  },
};