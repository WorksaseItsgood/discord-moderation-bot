const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('gravity')
    .setDescription('Gravity Falls meme')
    .addStringOption(option =>
      option.setName('bill')
        .setDescription('Bill cipher quote')
        .setRequired(true)),
  async execute(interaction) {
    const bill = interaction.options.getString('bill');
    
    const embed = {
      title: '💀 Bill Cipher',
      description: `"${bill}"\n\n_Reality is boring!_`,
      color: 0xFFD700,
      image: { url: 'https://i.imgur.com/d3iM8jU.png' },
    };

    await interaction.reply({ embeds: [embed] });
  },
};