/**
 * Commandinfo Command
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('commandinfo')
    .setDescription('Command info'),
  
  async execute(interaction, client) {
    const embed = new EmbedBuilder()
      .setTitle('🎮 Commandinfo')
      .setDescription('Command info')
      .setColor(0x5865F2)
      .setTimestamp();
    
    await interaction.reply({ embeds: [embed] });
  }
};
