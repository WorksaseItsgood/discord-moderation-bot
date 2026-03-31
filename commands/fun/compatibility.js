/**
 * Compatibility Command
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('compatibility')
    .setDescription('Check compatibility')
    .addUserOption(option => option.setName('user1').setDescription('First user').setRequired(true))
    .addUserOption(option => option.setName('user2').setDescription('Second user').setRequired(true)),
  
  async execute(interaction, client) {
    const user1 = interaction.options.getUser('user1');
    const user2 = interaction.options.getUser('user2');
    const percentage = Math.floor(Math.random() * 101);
    
    await interaction.reply({ content: `💘 Compatibility between ${user1.username} and ${user2.username}: ${percentage}%!` });
  }
};