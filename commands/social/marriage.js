/**
 * Marriage Command
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('marriage')
    .setDescription('View or propose marriage')
    .addStringOption(option => option.setName('action').setDescription('Action')
      .addChoices(
        { name: 'View', value: 'view' },
        { name: 'Propose', value: 'propose' },
        { name: 'Accept', value: 'accept' }
      ).setRequired(false))
    .addUserOption(option => option.setName('user').setDescription('User').setRequired(false)),
  
  async execute(interaction, client) {
    await interaction.reply({ content: '💍 Marriage system' });
  }
};