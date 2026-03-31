const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('logs')
    .setDescription('Show current log settings'),
  async execute(interaction) {
    const embed = {
      title: '📝 Log Settings',
      description: '**Channel:** #log-channel\n**Enabled:** ✅\n\nLog types:\n• Moderation: ✅\n• Messages: ✅\n• Voice: ✅\n• Members: ✅',
      color: 0x5865F2,
      timestamp: new Date().toISOString(),
    };

    await interaction.reply({ embeds: [embed] });
  },
};