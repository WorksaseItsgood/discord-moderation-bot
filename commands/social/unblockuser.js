/**
 * Unblock Command
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('unblockuser')
    .setDescription('Unblock a user')
    .addUserOption(option => option.setName('user').setDescription('User to unblock').setRequired(true)),
  
  async execute(interaction, client) {
    const user = interaction.options.getUser('user');
    
    await interaction.reply({ content: `✅ You unblocked ${user.username}!` });
  }
};