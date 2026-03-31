/**
 * Rep2 Command
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('rep2')
    .setDescription('Alt rep'),
  
  async execute(interaction, client) {
    const embed = new EmbedBuilder()
      .setTitle('🎮 Rep2')
      .setDescription('Alt rep')
      .setColor(0x5865F2)
      .setTimestamp();
    
    await interaction.reply({ embeds: [embed] });
  }
};
