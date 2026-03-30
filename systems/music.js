/**
 * Music System - DisTube-based music playback
 * Requires npm install distube @discordjs/opus
 */

const { DisTube } = require('distube');
const { SpotifyPlugin } = require('@distube/spotify');
const { SoundCloudPlugin } = require('@distube/soundcloud');

module.exports = (client) => {
  // Create DisTube instance
  client.distube = new DisTube(client, {
    searchSongs: 10,
    searchCooldown: 30,
    leaveOnEmpty: true,
    leaveOnEmptyCooldown: 60,
    leaveOnFinish: false,
    leaveOnStop: false,
    customFilter: {}, // Custom ffmpeg filters
    defaultVolume: 100,
    maxConnectors: 1,
    retryCount: 3,
    retryTimeout: 5000,
    plugins: [
      new SpotifyPlugin({
        clientId: process.env.SPOTIFY_CLIENT_ID || '',
        clientSecret: process.env.SPOTIFY_CLIENT_SECRET || ''
      }),
      new SoundCloudPlugin()
    ]
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