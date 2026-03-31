const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('button')
    .setDescription('Buttons meme')
    .addStringOption(option =>
      option.setName('button1')
        .setDescription('Button 1 text')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('button2')
        .setDescription('Button 2 text')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('result')
        .setDescription('Button result/clicked')
        .setRequired(true)),
  async execute(interaction) {
    const button1 = interaction.options.getString('button1');
    const button2 = interaction.options.getString('button2');
    const result = interaction.options.getString('result');
    
    const embed = {
      title: '🔘 Buttons Meme',
      description: `[${button1}]  [${button2}]\n\nClicked: ${result}`,
      color: 0x5865F2,
    };

    await interaction.reply({ embeds: [embed] });
  },
};