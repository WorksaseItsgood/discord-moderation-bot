/**
 * Lyrics Command
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('lyrics')
    .setDescription('Get lyrics for a song')
    .addStringOption(option => option.setName('song').setDescription('Song name').setRequired(true)),
  
  async execute(interaction, client) {
    const song = interaction.options.getString('song');
    
    const embed = new EmbedBuilder()
      .setTitle('🎵 Lyrics')
      .setDescription(`Lyrics for **${song}**\n\n_Loading lyrics..._`)
      .setColor(0x00ff00);
    
    await interaction.reply({ embeds: [embed] });
  }
};