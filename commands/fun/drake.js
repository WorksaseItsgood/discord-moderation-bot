const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('drake')
    .setDescription('Drake meme template')
    .addStringOption(option =>
      option.setName('top')
        .setDescription('Top text')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('bottom')
        .setDescription('Bottom text')
        .setRequired(true)),
  async execute(interaction) {
    const top = interaction.options.getString('top');
    const bottom = interaction.options.getString('bottom');
    
    const embed = {
      title: '🎤 Aubrey Says',
      description: `❌ ${top}\n\n✅ ${bottom}`,
      color: 0x5865F2,
    };

    await interaction.reply({ embeds: [embed] });
  },
};