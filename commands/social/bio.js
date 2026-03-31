/**
 * Bio Command
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('bio')
    .setDescription('View your bio')
    .addUserOption(option => option.setName('user').setDescription('User').setRequired(false)),
  
  async execute(interaction, client) {
    await interaction.reply({ content: '📝 Bio: Coming soon!' });
  }
};