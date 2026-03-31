/**
 * Rockpaperscissorslizardspock Command
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('rockpaperscissorslizardspock')
    .setDescription('Play RPSLS'),
  
  async execute(interaction, client) {
    const embed = new EmbedBuilder()
      .setTitle('🎮 Rockpaperscissorslizardspock')
      .setDescription('Play RPSLS')
      .setColor(0x5865F2)
      .setTimestamp();
    
    await interaction.reply({ embeds: [embed] });
  }
};
