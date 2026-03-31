const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('givedate')
    .setDescription('Set giveaway date'),
  async execute(interaction) {
    await interaction.reply({ content: 'Please use `/giveaway` command instead!', ephemeral: true });
  },
};