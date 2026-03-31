/**
 * Set Nickname Command
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setnick')
    .setDescription('Set a user\'s nickname')
    .addUserOption(option => option.setName('user').setDescription('User').setRequired(true))
    .addStringOption(option => option.setName('nickname').setDescription('New nickname').setRequired(true)),
  
  async execute(interaction, client) {
    const user = interaction.options.getUser('user');
    const nickname = interaction.options.getString('nickname');
    
    await interaction.reply({ content: `📛 Set ${user.username}'s nickname to **${nickname}**` });
  }
};