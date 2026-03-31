/**
 * Rep Given Command
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('repgiven')
    .setDescription('Give reputation points')
    .addUserOption(option => option.setName('user').setDescription('User').setRequired(true))
    .addIntegerOption(option => option.setName('amount').setDescription('Amount').setRequired(true)),
  
  async execute(interaction, client) {
    const user = interaction.options.getUser('user');
    const amount = interaction.options.getInteger('amount');
    
    await interaction.reply({ content: `⭐ You gave ${amount} rep to ${user.username}!` });
  }
};