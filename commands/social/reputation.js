/**
 * Reputation Command - Check reputation
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('reputation')
    .setDescription('Check your reputation')
    .addUserOption(option => option.setName('user').setDescription('User').setRequired(false)),
  
  async execute(interaction, client) {
    const embed = new EmbedBuilder()
      .setTitle('⭐ Reputation')
      .setDescription(`${interaction.user.username}: 50 rep points`)
      .setColor(0xffd700);
    
    await interaction.reply({ embeds: [embed] });
  }
};