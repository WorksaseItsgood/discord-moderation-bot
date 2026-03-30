const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

// Unlock command - unlock a channel to allow users to send messages
module.exports = {
  data: new SlashCommandBuilder()
    .setName('unlock')
    .setDescription('Unlock a channel (allow users to send messages)')
    .addChannelOption(option =>
      option.setName('channel')
        .setDescription('Channel to unlock (defaults to current channel)')
        .setRequired(false))
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('Reason for unlocking')
        .setRequired(false)),
  permissions: [PermissionFlagsBits.ManageChannels],
  async execute(interaction, client) {
    const channel = interaction.options.getChannel('channel') || interaction.channel;
    const reason = interaction.options.getString('reason') || 'No reason provided';
    
    // Get stored permissions or default to true
    const originalPerms = client.lockedChannels?.get(channel.id) ?? true;
    
    // Unlock the channel
    try {
      await channel.permissionOverwrites.edit(interaction.guild.roles.everyone, {
        SendMessages: originalPerms,
        AddReactions: originalPerms
      }, reason);
      
      // Remove from locked channels
      if (client.lockedChannels) {
        client.lockedChannels.delete(channel.id);
      }
      
      console.log(`[Unlock] ${channel.name} unlocked in ${interaction.guild.name}`);
      
      const embed = new EmbedBuilder()
        .setTitle('🔓 Channel Unlocked')
        .setColor(0x00ff00)
        .addFields(
          { name: 'Channel', value: channel.toString(), inline: true },
          { name: 'Reason', value: reason, inline: true }
        ));
      
      await interaction.reply({ embeds: [embed] });
      
      // Log to mod log channel
      const logChannel = interaction.guild.channels.cache.find(ch => 
        ch.name === 'mod-logs' || ch.name === 'moderation-logs'
      );
      
      if (logChannel && logChannel.id !== channel.id) {
        await logChannel.send({ embeds: [embed] });
      }
    } catch (error) {
      return interaction.reply({
        content: `❌ Error unlocking channel: ${error.message}`,
        ephemeral: true
      });
    }
  }
};