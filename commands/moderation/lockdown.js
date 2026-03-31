const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

// Lockdown command - lock all channels in the server
module.exports = {
  data: new SlashCommandBuilder()
    .setName('lockdown')
    .setDescription('Lock all channels (enable lockdown mode)')
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('Reason for lockdown')
        .setRequired(false)),
  permissions: [PermissionFlagsBits.Administrator],
  async execute(interaction, client) {
    const reason = interaction.options.getString('reason') || 'No reason provided';
    const guild = interaction.guild;
    
    // Store all channel original permissions
    if (!client.lockedChannels) {
      client.lockedChannels = new Map();
    }
    
    // Set lockdown state
    client.lockdownState = client.lockdownState || new Map();
    client.lockdownState.set(guild.id, {
      active: true,
      moderator: interaction.user.tag,
      reason: reason,
      timestamp: Date.now()
    });
    
    // Get all text and voice channels
    const channels = guild.channels.cache.filter(ch => 
      ch.type === 0 || ch.type === 2 || ch.type === 15 // text, voice, forum
    );
    
    let lockedCount = 0;
    for (const [channelId, channel] of channels) {
      try {
        // Store original permissions
        const originalPerms = channel.permissionOverwrites.cache.get(guild.roles.everyone.id);
        const sendMessages = originalPerms?.allow.has('SendMessages') ?? 
                          originalPerms?.deny.has('SendMessages') === false;
        
        client.lockedChannels.set(channelId, {
          sendMessages: sendMessages,
          connect: originalPerms?.allow.has('Connect') ?? true
        });
        
        // Lock the channel
        await channel.permissionOverwrites.edit(guild.roles.everyone, {
          SendMessages: false,
          AddReactions: false,
          Connect: false,
          Speak: false
        }, reason);
        
        lockedCount++;
      } catch (error) {
        console.log(`[Lockdown] Error locking channel ${channel.name}: ${error.message}`);
      }
    }
    
    console.log(`[Lockdown] Enabled in ${guild.name}. ${lockedCount} channels locked.`);
    
    const embed = new EmbedBuilder()
      .setTitle('🔒 Lockdown Enabled')
      .setColor(0xff0000)
      .addFields(
        { name: 'Channels Locked', value: String(lockedCount), inline: true },
        { name: 'Reason', value: reason, inline: true }
      );
    
    await interaction.reply({ embeds: [embed] });
    
    // Log to mod log channel
    const logChannel = guild.channels.cache.find(ch => 
      ch.name === 'mod-logs' || ch.name === 'moderation-logs'
    );
    
    if (logChannel) {
      await logChannel.send({ embeds: [embed] });
    }
    
    // Notify in raid log channel if configured
    const config = require('../../config').defaultConfig;
    if (config.raid?.logChannel) {
      const raidLogChannel = guild.channels.cache.get(config.raid.logChannel);
      if (raidLogChannel) {
        await raidLogChannel.send({ embeds: [embed] });
      }
    }
  }
};