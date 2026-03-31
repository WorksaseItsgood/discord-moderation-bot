/**
 * NowPlaying Command - Show current song
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('nowplaying')
    .setDescription('Show current song'),
  
  async execute(interaction, client) {
    if (!client.distube) {
      return interaction.reply({ content: 'Music system not loaded!', ephemeral: true });
    }
    
    const queue = client.distube.getQueue(interaction.guild);
    if (!queue || !queue.songs.length) {
      return interaction.reply({ content: 'Nothing is playing!', ephemeral: true });
    }
    
    const song = queue.songs[0];
    
    const embed = new EmbedBuilder()
      .setTitle('🎵 Now Playing')
      .setDescription(`[${song.name}](${song.url})`)
      .addFields(
        { name: '⏱️ Duration', value: song.formattedDuration },
        { name: '🎤 Artist', value: song.uploader?.name || 'Unknown' },
        { name: '🔊 Volume', value: `${queue.volume}%` },
        { name: '🔁 Loop', value: queue.repeatMode ? 'On' : 'Off' }
      )
      .setThumbnail(song.thumbnail)
      .setColor(0x00ff00);
    
    await interaction.reply({ embeds: [embed] });
  }
};