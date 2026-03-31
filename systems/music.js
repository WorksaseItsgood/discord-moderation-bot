/**
 * Music System - DisTube-based music playback
 * Requires npm install distube @discordjs/opus
 */

const { DisTube } = require('distube');
const { SpotifyPlugin } = require('@distube/spotify');
const { SoundCloudPlugin } = require('@distube/soundcloud');

module.exports = (client) => {
  // Build plugins array conditionally
  const plugins = [new SoundCloudPlugin()];
  if (process.env.SPOTIFY_CLIENT_ID && process.env.SPOTIFY_CLIENT_SECRET) {
    plugins.unshift(new SpotifyPlugin({
      clientId: process.env.SPOTIFY_CLIENT_ID,
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET
    }));
  }
  
  // Create DisTube instance
  client.distube = new DisTube(client, {
    plugins: plugins
  });
  
  // Status events
  client.distube.on('playSong', (queue, song) => {
    const embed = new (require('discord.js').EmbedBuilder)()
      .setTitle('🎵 Now Playing')
      .setDescription(`[${song.name}](${song.url})`)
      .addFields(
        { name: '⏱️ Duration', value: song.formattedDuration },
        { name: '🎤 Artist', value: song.uploader.name },
        { name: '👀️ Views', value: song.views.toLocaleString() }
      )
      .setThumbnail(song.thumbnail)
      .setColor(0x00ff00);
    
    queue.textChannel?.send({ embeds: [embed] });
  });
  
  client.distube.on('addSong', (queue, song) => {
    const embed = new (require('discord.js').EmbedBuilder)()
      .setTitle('🎵 Song Added')
      .setDescription(`[${song.name}](${song.url})`)
      .addFields({ name: '⏱️ Duration', value: song.formattedDuration })
      .setColor(0x0099ff);
    
    queue.textChannel?.send({ embeds: [embed] });
  });
  
  client.distube.on('disconnect', (queue) => {
    queue.textChannel?.send('👋 Disconnected from voice channel!');
  });
  
  client.distube.on('error', (channel, error) => {
    console.error('[Distube] Error:', error);
    channel?.send(`❌ Error: ${error.message}`);
  });
  
  console.log('[System] Music system (DisTube) initialized');
  
  return client.distube;
};