const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('lenny')
    .setDescription('( ͡° ͜ʖ ͡°)'),
  async execute(interaction) {
    const lennys = [
      '( ͡° ͜ʖ ͡°)',
      '( ͡° ͜ʖ ͡° )',
      '( ͡° ͜ʖ ͡°)👍',
      '¯\\_( ͡° ͜ʖ ͡°)_/¯',
    ];

    await interaction.reply({ content: lennys[Math.floor(Math.random() * lennys.length)] });
  },
};