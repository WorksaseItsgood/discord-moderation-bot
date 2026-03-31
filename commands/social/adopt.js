/**
 * Adopt Command
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('adopt')
    .setDescription('Adopt someone as a child')
    .addUserOption(option => option.setName('user').setDescription('User to adopt').setRequired(true)),
  
  async execute(interaction, client) {
    const user = interaction.options.getUser('user');
    
    await interaction.reply({ content: `👶 You adopted ${user.username}!` });
  }
};