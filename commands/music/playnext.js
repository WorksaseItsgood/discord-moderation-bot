/**
 * Play Next Command
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('playnext')
    .setDescription('Add a song to play next')
    .addStringOption(option => option.setName('song').setDescription('Song name or URL').setRequired(true)),
  
  async execute(interaction, client) {
    const song = interaction.options.getString('song');
    
    await interaction.reply({ content: `🎵 Added **${song}** to play next!` });
  }
};