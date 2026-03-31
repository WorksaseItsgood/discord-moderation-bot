/**
 * Best Friend Command
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('bestfriend')
    .setDescription('Set your best friend')
    .addUserOption(option => option.setName('user').setDescription('User').setRequired(true)),
  
  async execute(interaction, client) {
    const user = interaction.options.getUser('user');
    
    await interaction.reply({ content: `⭐ ${user.username} is now your best friend!` });
  }
};