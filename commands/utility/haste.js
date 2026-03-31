/**
 * Haste Command
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('haste')
    .setDescription('Create hastebin'),
  
  async execute(interaction, client) {
    const embed = new EmbedBuilder()
      .setTitle('🎮 Haste')
      .setDescription('Create hastebin')
      .setColor(0x5865F2)
      .setTimestamp();
    
    await interaction.reply({ embeds: [embed] });
  }
};
