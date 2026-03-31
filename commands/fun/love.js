/**
 * Love Command - Calculate love percentage
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('love')
    .setDescription('Calculate love percentage')
    .addUserOption(option => option.setName('user').setDescription('User to check').setRequired(true)),
  
  async execute(interaction, client) {
    const user = interaction.options.getUser('user');
    const percentage = Math.floor(Math.random() * 101);
    
    const embed = new EmbedBuilder()
      .setTitle('❤️ Love Meter')
      .setDescription(`You and ${user.username}: **${percentage}%** in love!`)
      .setColor(0xff0000);
    
    await interaction.reply({ embeds: [embed] });
  }
};