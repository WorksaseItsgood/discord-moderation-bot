const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('reverse')
    .setDescription('Reverse text')
    .addStringOption(option =>
      option.setName('text')
        .setDescription('Text to reverse')
        .setRequired(true)),
  async execute(interaction) {
    const text = interaction.options.getString('text');
    const reversed = text.split('').reverse().join('');

    const embed = {
      title: '🔄 Reversed Text',
      description: `**Original:** ${text}\n**Reversed:** ${reversed}`,
      color: 0x5865F2,
      timestamp: new Date().toISOString(),
    };

    await interaction.reply({ embeds: [embed] });
  },
};