/**
 * Parents Command
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('parents')
    .setDescription('View your parents'),
  
  async execute(interaction, client) {
    await interaction.reply({ content: '👨‍👩‍👦 Your parents: Unknown' });
  }
};