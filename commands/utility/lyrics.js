const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

// Lyrics command - Song lyrics lookup
module.exports = {
  data: new SlashCommandBuilder()
    .setName('lyrics')
    .setDescription('Get song lyrics')
    .addStringOption(option =>
      option.setName('song')
        .setDescription('Song name')
        .setRequired(true)),
  async execute(interaction, client) {
    const song = interaction.options.getString('song');
    
    const embed = new EmbedBuilder()
      .setTitle('🎵 Lyrics: ' + song)
      .setColor(0x9b59b6)
      .setDescription('Looking up lyrics for: ' + song + '\n\n*Lyrics lookup requires API key.*')
      .setFooter({ text: 'Use /lyrics for full lyrics (API required)' });
    
    await interaction.reply({ embeds: [embed] });
  }
};