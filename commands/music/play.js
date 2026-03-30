/**
 * Play Command - Play music
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('play')
    .setDescription('Play music')
    .addStringOption(option =>
      option.setName('query')
        .setDescription('Song name or URL')
        .setRequired(true)
    ),
  
  async execute(interaction, client) {
    const query = interaction.options.getString('query');
    const channel = interaction.member.voice.channel;
    
    if (!channel) {
      return interaction.reply({ content: 'You must be in a voice channel!', ephemeral: true });
    }
    
    // Join voice channel if not already in
    if (!interaction.guild.members.cache.get(client.user.id)?.voice.channel) {
      await interaction.reply({ content: 'Joining voice channel...', ephemeral: true });
    }
    
    try {
      await client.distube.playVoiceChannel(channel, query, {
        textChannel: interaction.channel,
        member: interaction.member
      });
      
      await interaction.reply({ content: `🔍 Searching for: ${query}...`, ephemeral: true });
    } catch (e) {
      console.error('[Play] Error:', e);
      await interaction.reply({ content: `Error: ${e.message}`, ephemeral: true });
    }
  }
};