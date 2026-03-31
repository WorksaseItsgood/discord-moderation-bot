/**
 * Wanted Command
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('wanted')
    .setDescription('Generate wanted poster'),
  
  async execute(interaction, client) {
    const embed = new EmbedBuilder()
      .setTitle('🎮 Wanted')
      .setDescription('Generate wanted poster')
      .setColor(0x5865F2)
      .setTimestamp();
    
    await interaction.reply({ embeds: [embed] });
  }
};
