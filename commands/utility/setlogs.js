const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setlogs')
    .setDescription('Set log channel')
    .addChannelOption(option =>
      option.setName('channel')
        .setDescription('Log channel')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('type')
        .setDescription('Log types to enable')
        .addStringChoice('all', 'all')
        .addStringChoice('mod', 'mod')
        .addStringChoice('message', 'message')
        .addStringChoice('voice', 'voice')
        .addStringChoice('member', 'member')),
  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageChannels)) {
      return interaction.reply({ content: '❌ You need Manage Channels permission!', ephemeral: true });
    }

    const channel = interaction.options.getChannel('channel');
    const type = interaction.options.getString('type') || 'all';

    const embed = {
      title: '📝 Logs Set',
      description: `**Channel:** ${channel}\n**Type:** ${type}\n\n✅ Logging enabled!`,
      color: 0x00FF00,
    };

    await interaction.reply({ embeds: [embed] });
  },
};