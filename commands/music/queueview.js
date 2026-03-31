/**
 * Queue View Command
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('queueview')
    .setDescription('View the current queue'),
  
  async execute(interaction, client) {
    const embed = new EmbedBuilder()
      .setTitle('📋 Music Queue')
      .setDescription('Now Playing: Song Name - Artist\n\nUp Next:\n1. Song 2 - Artist 2\n2. Song 3 - Artist 3\n3. Song 4 - Artist 4')
      .setColor(0x00ff00);
    
    await interaction.reply({ embeds: [embed] });
  }
};