/**
 * Voice Stats Command
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('voicestats')
    .setDescription('View voice activity statistics'),
  
  async execute(interaction, client) {
    const embed = new EmbedBuilder()
      .setTitle('🎤 Voice Stats')
      .addFields(
        { name: 'Currently in VC', value: '12 users', inline: true },
        { name: 'Total Time', value: '500 hours', inline: true },
        { name: 'Most Active', value: 'User1', inline: true }
      )
      .setColor(0x00ff00);
    
    await interaction.reply({ embeds: [embed] });
  }
};