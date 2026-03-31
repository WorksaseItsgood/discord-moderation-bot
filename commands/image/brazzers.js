/**
 * Brazzers Logo Command
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('brazzers')
    .setDescription('Add brazzers logo')
    .addUserOption(option => option.setName('user').setDescription('User').setRequired(false)),
  
  async execute(interaction, client) {
    await interaction.reply({ content: '🔴 Brazzers style: Coming soon!' });
  }
};