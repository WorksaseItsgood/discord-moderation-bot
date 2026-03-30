/**
 * Ping Command - Check bot ping
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Check bot ping'),
  
  async execute(interaction, client) {
    const wsPing = client.ws.ping;
    const msg = await interaction.reply({ content: 'Pinging...', ephemeral: true, fetchReply: true });
    
    const apiPing = msg.createdTimestamp - interaction.createdTimestamp;
    
    const embed = new EmbedBuilder()
      .setTitle('🏓 Pong!')
      .setColor(wsPing < 100 ? 0x00ff00 : wsPing < 200 ? 0xffaa00 : 0xff0000)
      .addFields(
        { name: '📡 WebSocket', value: `${wsPing}ms`, inline: true },
        { name: '💬 API', value: `${apiPing}ms`, inline: true }
      );
    
    await interaction.editReply({ content: '', embeds: [embed] });
  }
};