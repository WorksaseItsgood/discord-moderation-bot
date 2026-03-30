const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

// Lock command - lock a channel to prevent users from sending messages
module.exports = {
  data: new SlashCommandBuilder()
    .setName('lock')
    .setDescription('Lock a channel (prevent users from sending messages)')
    .addChannelOption(option =>
      option.setName('channel')
        .setDescription('Channel to lock (defaults to current channel)')
        .setRequired(false))
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('Reason for locking')
        .setRequired(false)),
  permissions: [PermissionFlagsBits.ManageChannels],
  async execute(interaction, client) {
    const channel = interaction.options.getChannel('channel') || interaction.channel;
    const reason = interaction.options.getString('reason') || 'No reason provided';
    
    // Store original permissions
    if (!client.lockedChannels) {
      client.lockedChannels = new Map();
    }
    
    const originalPerms = channel.permissionOverwrites.cache.get(interaction.guild.roles.everyone.id)?.allow.has('SendMessages') ?? true;
    client.lockedChannels.set(channel.id, originalPerms);
    
    // Lock the channel
    try {
      await channel.permissionOverwrites.edit(interaction.guild.roles.everyone, {
        SendMessages: false,
        AddReactions: false
      }, reason);
      
      console.log(`[Lock] ${channel.name} locked in ${interaction.guild.name}. Reason: ${reason}`);
      
      const embed = new EmbedBuilder()
        .setTitle('🔒 Channel Locked')
        .setColor(0xff0000)
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
        content: `❌ Error locking channel: ${error.message}`,
        ephemeral: true
      });
    }
  }
};