const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('uptime')
    .setDescription('Get bot uptime'),
  async execute(interaction) {
    const client = interaction.client;
    const uptime = client.uptime;
    
    if (!uptime) {
      return interaction.reply({ content: 'Bot is restarting...', ephemeral: true });
    }
    
    const seconds = Math.floor(uptime / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    const embed = {
      title: '⏱️ Bot Uptime',
      description: `**${days}d ${hours % 24}h ${minutes % 60}m ${seconds % 60}s**`,
      color: 0x5865F2,
      timestamp: new Date().toISOString(),
    };

    await interaction.reply({ embeds: [embed] });
  },
};