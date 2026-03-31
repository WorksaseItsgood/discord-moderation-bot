/**
 * Reset Nickname Command
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('resetnick')
    .setDescription('Reset a user\'s nickname')
    .addUserOption(option => option.setName('user').setDescription('User').setRequired(true)),
  
  async execute(interaction, client) {
    const user = interaction.options.getUser('user');
    
    await interaction.reply({ content: `📛 Reset ${user.username}'s nickname!` });
  }
};