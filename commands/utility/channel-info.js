/**
 * Channel Info Command - Get channel information
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('channel-info')
    .setDescription('Get channel information')
    .addChannelOption(option =>
      option.setName('channel')
        .setDescription('Channel to get info (optional)')
    ),
  
  async execute(interaction, client) {
    const channel = interaction.options.getChannel('channel') || interaction.channel;
    const guild = interaction.guild;
    
    const embed = new EmbedBuilder()
      .setTitle(`#${channel.name}`)
      .setColor(0x0099ff)
      .addFields(
        { name: '🆔 ID', value: channel.id, inline: true },
        { name: '📋 Type', value: channel.type.toString(), inline: true },
        { name: '📁 Category', value: channel.parent?.name || 'None', inline: true },
        { name: '📅 Created', value: `<t:${Math.floor(channel.createdTimestamp / 1000)}:R>`, inline: true },
        { name: '🔗 Position', value: `${channel.position}`, inline: true }
      );
    
    if (channel.type === 0) { // Text channel
      embed.addFields(
        { name: '💬 NSFW', value: channel.nsfw ? 'Yes' : 'No', inline: true },
        { name: '⏱️ Slowmode', value: `${channel.rateLimitPerUser}s`, inline: true },
        { name: '📝 Topic', value: channel.topic || 'None' }
      );
    } else if (channel.type === 2) { // Voice channel
      embed.addFields(
        { name: '👥 User Limit', value: `${channel.userLimit || 'Unlimited'}`, inline: true },
        { name: '🔊 Bitrate', value: `${channel.bitrate / 1000}kbps`, inline: true }
      );
    }
    
    await interaction.reply({ embeds: [embed] });
  }
};