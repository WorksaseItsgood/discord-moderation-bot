const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

// Lockdown command - Enhanced lockdown system
module.exports = {
  data: new SlashCommandBuilder()
    .setName('lockdown')
    .setDescription('Lock down the server')
    .addStringOption(option =>
      option.setName('mode')
        .setDescription('lock, unlock, or status')
        .setRequired(false)),
  permissions: [PermissionFlagsBits.ManageChannels],
  async execute(interaction, client) {
    const mode = interaction.options.getString('mode') || 'lock';
    
    if (mode === 'status') {
      const isLocked = client.lockdown && client.lockdown.get(interaction.guild.id);
      return interaction.reply({ content: isLocked ? 'Server is locked down' : 'Server is not locked', ephemeral: true });
    }
    
    const channels = interaction.guild.channels.cache.filter(ch => ch.type === 0);
    
    if (mode === 'lock') {
      for (const channel of channels) {
        await channel.permissionOverwrites.edit(interaction.guild.id, { SendMessages: false });
      }
      
      if (!client.lockdown) client.lockdown = new Map();
      client.lockdown.set(interaction.guild.id, true);
      
      const embed = new EmbedBuilder()
        .setTitle('Server Locked Down')
        .setColor(0xe74c3c)
        .setDescription('All channels locked.');
      
      await interaction.reply({ embeds: [embed] });
    } else {
      for (const channel of channels) {
        await channel.permissionOverwrites.edit(interaction.guild.id, { SendMessages: null });
      }
      
      if (client.lockdown) client.lockdown.delete(interaction.guild.id);
      
      const embed = new EmbedBuilder()
        .setTitle('Server Unlocked')
        .setColor(0x2ecc71)
        .setDescription('All channels unlocked.');
      
      await interaction.reply({ embeds: [embed] });
    }
  }
};