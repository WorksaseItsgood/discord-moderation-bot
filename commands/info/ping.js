const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

// Ping command - check bot latency
module.exports = {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Check bot latency'),
  permissions: [],
  async execute(interaction, client) {
    const sent = await interaction.reply({ 
      content: 'Pinging...', 
      fetchReply: true 
    });
    
    const latency = sent.createdTimestamp - interaction.createdTimestamp;
    const apiLatency = client.ws.ping;
    
    const embed = new EmbedBuilder()
      .setTitle('🏓 Pong!')
      .setColor(0x00ff00)
      .addFields(
        { name: 'Message Latency', value: `${latency}ms`, inline: true },
        { name: 'API Latency', value: `${apiLatency}ms`, inline: true },
        { name: 'Uptime', value: formatUptime(client.uptime), inline: true }
      ));
    
    await interaction.editReply({ content: '', embeds: [embed] });
  }
};

function formatUptime(uptime) {
  if (!uptime) return 'Unknown';
  
  const seconds = Math.floor(uptime / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) {
    return `${days}d ${hours % 24}h`;
  } else if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  } else {
    return `${seconds}s`;
  }
}