/**
 * Voice Join Command - Bot joins voice channel
 */

const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('voice-join')
    .setDescription('Join a voice channel')
    .addChannelOption(option =>
      option.setName('channel')
        .setDescription('Voice channel to join')
        .setRequired(false)
    ),
  
  async execute(interaction, client) {
    const channel = interaction.options.getChannel('channel');
    
    if (!channel || channel.type !== 2) {
      // Check if user is in a voice channel
      const member = interaction.member;
      const voiceChannel = member.voice?.channel;
      
      if (!voiceChannel) {
        return interaction.reply({ content: 'You must be in a voice channel or specify one!', ephemeral: true });
      }
      
      await voiceChannel.join();
      await interaction.reply(`✅ Joined ${voiceChannel}!`);
    } else {
      await channel.join();
      await interaction.reply(`✅ Joined ${channel}!`);
    }
  }
};