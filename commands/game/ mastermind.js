/**
 *  mastermind Command
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName(' mastermind')
    .setDescription('Play Mastermind code breaker'),
  
  async execute(interaction, client) {
    const embed = new EmbedBuilder()
      .setTitle('🎮  mastermind')
      .setDescription('Play Mastermind code breaker')
      .setColor(0x5865F2)
      .setTimestamp();
    
    await interaction.reply({ embeds: [embed] });
  }
};
