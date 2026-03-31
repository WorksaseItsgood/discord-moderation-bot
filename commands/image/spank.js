/**
 * Spank Command
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('spank')
    .setDescription('Spank a user')
    .addUserOption(option => option.setName('user').setDescription('User').setRequired(true)),
  
  async execute(interaction, client) {
    const user = interaction.options.getUser('user');
    
    await interaction.reply({ content: `👋 Spanked ${user.username}!` });
  }
};