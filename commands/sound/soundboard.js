/**
 * Soundboard Command
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('soundboard')
    .setDescription('View soundboard'),
  
  async execute(interaction, client) {
    const embed = new EmbedBuilder()
      .setTitle('🔊 Soundboard')
      .setDescription('Available sounds:')
      .addFields(
        { name: '1. airhorn', value: '🎺', inline: true },
        { name: '2. sad trombone', value: '🎺', inline: true },
        { name: '3. rimshot', value: '🥁', inline: true },
        { name: '4. wow', value: '😲', inline: true },
        { name: '5.yeet', value: '🎉', inline: true }
      )
      .setColor(0x00ff00);
    
    await interaction.reply({ embeds: [embed] });
  }
};