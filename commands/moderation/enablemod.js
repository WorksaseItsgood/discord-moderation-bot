/**
 * Enablemod Command
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('enablemod')
    .setDescription('Enable mod'),
  
  async execute(interaction, client) {
    const embed = new EmbedBuilder()
      .setTitle('🎮 Enablemod')
      .setDescription('Enable mod')
      .setColor(0x5865F2)
      .setTimestamp();
    
    await interaction.reply({ embeds: [embed] });
  }
};
