const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('distracted')
    .setDescription('Distracted boyfriend meme')
    .addStringOption(option =>
      option.setName('boyfriend')
        .setDescription('What the boyfriend is looking at')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('girlfriend')
        .setDescription('The distracted girlfriend')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('other')
        .setDescription('The new thing')
        .setRequired(true)),
  async execute(interaction) {
    const boyfriend = interaction.options.getString('boyfriend');
    const girlfriend = interaction.options.getString('girlfriend');
    const other = interaction.options.getString('other');
    
    const embed = {
      title: '👀 Distracted Boyfriend',
      description: `**Me:** ${girlfriend}\n**Looking at:** ${boyfriend}\n**New thing:** ${other}`,
      color: 0xFF69B4,
    };

    await interaction.reply({ embeds: [embed] });
  },
};