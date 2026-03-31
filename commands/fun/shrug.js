const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('shrug')
    .setDescription('Shrug animation'),
  async execute(interaction) {
    const shrugs = [
      '¯\\_(ツ)_/¯',
      '¯\\_(°□°)_/¯',
      'shrug\n¯\\_(ツ)_/¯',
      '¯\\_(❛_❛)_/¯',
    ];

    await interaction.reply({ content: shrugs[Math.floor(Math.random() * shrugs.length)] });
  },
};