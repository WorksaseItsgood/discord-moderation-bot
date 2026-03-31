const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('itsstupid')
    .setDescription('It\'s Stupid Meme')
    .addStringOption(option =>
      option.setName('text')
        .setDescription('Text to add')
        .setRequired(true)),
  async execute(interaction) {
    const text = interaction.options.getString('text');
    
    const embed = {
      title: '🤦 It\'s Stupid',
      description: `It's stupid!\n\n${text}`,
      color: 0xFF0000,
    };

    await interaction.reply({ embeds: [embed] });
  },
};