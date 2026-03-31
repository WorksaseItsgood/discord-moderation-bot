/**
 * Unfriend Command
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('unfriend')
    .setDescription('Remove a friend')
    .addUserOption(option => option.setName('user').setDescription('User').setRequired(true)),
  
  async execute(interaction, client) {
    const user = interaction.options.getUser('user');
    
    await interaction.reply({ content: `👋 You removed ${user.username} from your friends.` });
  }
};