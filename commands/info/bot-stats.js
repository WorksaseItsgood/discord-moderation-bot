/**
 * Bot Stats Command - Get bot statistics
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('bot-stats')
    .setDescription('Get bot statistics'),
  
  async execute(interaction, client) {
    const totalMembers = client.guilds.cache.reduce((acc, g) => acc + g.memberCount, 0);
    const totalChannels = client.guilds.cache.reduce((acc, g) => acc + g.channels.cache.size, 0);
    
    const memoryUsage = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);
    const uptime = process.uptime();
    
    const embed = new EmbedBuilder()
      .setTitle('📊 Bot Statistics')
      .setColor(0x0099ff)
      .addFields(
        { name: '🏢 Servers', value: `${client.guilds.cache.size}`, inline: true },
        { name: '👥 Total Members', value: `${totalMembers}`, inline: true },
        { name: '💬 Channels', value: `${totalChannels}`, inline: true },
        { name: '📶 WebSocket Ping', value: `${client.ws.ping}ms`, inline: true },
        { name: '💾 Memory Usage', value: `${memoryUsage} MB`, inline: true },
        { name: '⏰ Uptime', value: formatUptime(uptime) }
      )
      .setFooter({ text: `Node.js ${process.version}` });
    
    await interaction.reply({ embeds: [embed] });
  }
};

function formatUptime(seconds) {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  if (days > 0) return `${days}d ${hours}h ${minutes}m`;
  if (hours > 0) return `${hours}h ${minutes}m ${secs}s`;
  return `${minutes}m ${secs}s`;
}