const { SlashCommandBuilder } = require('discord.js');
const axios = require('axios');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('twitch')
    .setDescription('Get Twitch stream status')
    .addStringOption(option =>
      option.setName('channel')
        .setDescription('Twitch channel name')
        .setRequired(true)),
  async execute(interaction) {
    const channel = interaction.options.getString('channel');
    
    try {
      const response = await axios.get(`https://twitch.tv/${channel}`);
      const embed = {
        title: `📺 ${channel} - Twitch`,
        description: `**Status:** ${response.data.isLive ? '🔴 LIVE' : '⚫ Offline'}\n${response.data.title || ''}`,
        color: response.data.isLive ? 0xFF0000 : 0x808080,
        thumbnail: response.data.isLive ? { url: response.data.thumbnail } : null,
      };
      
      await interaction.reply({ embeds: [embed] });
    } catch (e) {
      const embed = {
        title: `📺 ${channel}`,
        description: '⚫ Channel not found or offline',
        color: 0x808080,
      };
      await interaction.reply({ embeds: [embed] });
    }
  },
};