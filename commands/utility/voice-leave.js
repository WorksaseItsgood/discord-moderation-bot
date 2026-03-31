/**
 * Voice Leave Command - Bot leaves voice channel
 */

const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('voice-leave')
    .setDescription('Leave the voice channel'),
  
  async execute(interaction, client) {
    const voiceConnection = client.distube?.getQueue(interaction.guild)?.voice;
    
    if (!voiceConnection) {
      // Try to get the bot's voice connection
      const guild = client.guilds.cache.get(interaction.guildId);
      if (guild?.me?.voice?.channel) {
        guild.me.voice.disconnect();
        return interaction.reply('👋 Left voice channel!');
      }
      return interaction.reply({ content: 'Bot is not in a voice channel!', ephemeral: true });
    }
    
    if (client.distube) {
      client.distube.stop(interaction.guild);
    }
    
    voiceConnection.disconnect();
    await interaction.reply('👋 Left voice channel!');
  }
};