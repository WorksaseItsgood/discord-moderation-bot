/**
 * Wasted Command
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('wasted')
    .setDescription('Add GTA wasted overlay')
    .addUserOption(option => option.setName('user').setDescription('User').setRequired(false)),
  
  async execute(interaction, client) {
    const user = interaction.options.getUser('user') || interaction.user;
    
    await interaction.reply({ content: `💀 Wasted: ${user.username}` });
  }
};