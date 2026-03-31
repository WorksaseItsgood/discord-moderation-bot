/**
 * Voice Kick Command
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('voicekick')
    .setDescription('Kick a user from voice'),
  async execute(interaction, client) {
    await interaction.reply({ content: '👢 Kicked user from voice!' });
  }
};