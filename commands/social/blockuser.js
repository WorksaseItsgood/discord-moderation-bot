/**
 * Block Command
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('blockuser')
    .setDescription('Block a user')
    .addUserOption(option => option.setName('user').setDescription('User to block').setRequired(true)),
  
  async execute(interaction, client) {
    const user = interaction.options.getUser('user');
    
    await interaction.reply({ content: `🚫 You blocked ${user.username}!` });
  }
};