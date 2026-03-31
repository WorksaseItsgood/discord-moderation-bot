const { EmbedBuilder } = require('discord.js');

/**
 * ULTRA MUSIC SYSTEM
 * Play, pause, skip, queue, volume, shuffle, loop
 */

class UltraMusicSystem {
  constructor(client) {
    this.client = client;
    this.queues = new Map();
    this.nowPlaying = new Map();
    this.volume = new Map();
    
    this.config = {
      defaultVolume: 50,
      maxQueueSize: 100,
      searchPlatform: 'youtube',
      loopMode: 'off', // off, one, all
      bassBoost: 0,
      nightcore: false,
    };
  }
  
  async joinVoiceChannel(member) {
    if (!member.voice.channel) {
      throw new Error('Not in voice channel');
    }
    
    const voiceChannel = member.voice.channel;
    const connection = await voiceChannel.join();
    
    this.volume.set(member.guild.id, this.config.defaultVolume);
    
    return connection;
  }
  
  async play(guild, query, member) {
    const channel = member.voice.channel;
    if (!channel) {
      throw new Error('Join a voice channel first');
    }
    
    // Get queue
    let queue = this.queues.get(guild.id);
    if (!queue) {
      queue = [];
      this.queues.set(guild.id, queue);
    }
    
    // Search for track (would use ytdl in real implementation)
    const track = {
      id: Date.now().toString(),
      url: query,
      title: query,
      duration: 0,
      requestedBy: member.id,
    };
    
    queue.push(track);
    
    if (queue.length === 1) {
      // Play immediately
      this.playNext(guild);
    }
    
    return track;
  }
  
  async playNext(guild) {
    const queue = this.queues.get(guild.id);
    if (!queue || queue.length === 0) {
      this.nowPlaying.delete(guild.id);
      return null;
    }
    
    const track = queue[0];
    this.nowPlaying.set(guild.id, track);
    
    // Would play audio here
    
    return track;
  }
  
  async pause(guild) {
    // Would pause
    return true;
  }
  
  async resume(guild) {
    // Would resume
    return true;
  }
  
  async skip(guild) {
    const queue = this.queues.get(guild.id);
    if (!queue || queue.length === 0) return false;
    
    queue.shift();
    await this.playNext(guild);
    
    return true;
  }
  
  async stop(guild) {
    const queue = this.queues.get(guild.id);
    if (queue) {
      queue.length = 0;
    }
    this.nowPlaying.delete(guild.id);
    
    return true;
  }
  
  async queue(guild) {
    return this.queues.get(guild.id) || [];
  }
  
  async nowPlaying(guild) {
    return this.nowPlaying.get(guild.id);
  }
  
  async setVolume(guild, volume) {
    this.volume.set(guild.id, Math.max(0, Math.min(100, volume)));
    return this.volume.get(guild.id);
  }
  
  async shuffle(guild) {
    const queue = this.queues.get(guild.id);
    if (!queue || queue.length < 2) return false;
    
    // Fisher-Yates shuffle
    for (let i = queue.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [queue[i], queue[j]] = [queue[j], queue[i]];
    }
    
    return true;
  }
  
  async loop(guild, mode) {
    // mode: off, one, all
    this.config.loopMode = mode;
    return mode;
  }
  
  async remove(guild, index) {
    const queue = this.queues.get(guild.id);
    if (!queue || index < 0 || index >= queue.length) return false;
    
    const removed = queue.splice(index, 1)[0];
    return removed;
  }
  
  async clearQueue(guild) {
    const queue = this.queues.get(guild.id);
    if (queue) {
      queue.length = 0;
    }
    return true;
  }
  
  async createQueueEmbed(guild, title = 'Queue') {
    const queue = this.queues.get(guild.id) || [];
    const current = this.nowPlaying.get(guild.id);
    
    let description = '';
    if (current) {
      description += `**Now Playing:** ${current.title}\n\n`;
    }
    
    if (queue.length > 0) {
      description += queue.map((t, i) => `${i + 1}. ${t.title}`).join('\n');
    }
    
    const embed = new EmbedBuilder()
      .setTitle(`🎵 ${title}`)
      .setDescription(description || 'Queue is empty')
      .setColor(0x5865F2);
    
    return embed;
  }
}

module.exports = UltraMusicSystem;