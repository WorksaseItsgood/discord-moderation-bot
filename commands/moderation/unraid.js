const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

// Unraid command - disable lockdown mode
module.exports = {
  data: new SlashCommandBuilder()
    .setName('unraid')
    .setDescription('Disable lockdown mode (unlock all channels)')
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('Reason for ending lockdown')
        .setRequired(false)),
  permissions: [PermissionFlagsBits.Administrator],
  async execute(interaction, client) {
    const reason = interaction.options.getString('reason') || 'No reason provided';
    const guild = interaction.guild;
    
    // Check if lockdown is active
    const lockdownState = client.lockdownState?.get(guild.id);
    if (!lockdownState || !lockdownState.active) {
      return interaction.reply({
        content: '❌ Lockdown is not currently active!',
        ephemeral: true
      });
    }
    
    // Get all text and voice channels
    const channels = guild.channels.cache.filter(ch => 
      ch.type === 0 || ch.type === 2 || ch.type === 15 // text, voice, forum
    );
    
    let unlockedCount = 0;
    for (const [channelId, channel] of channels) {
      try {
        // Get stored permissions
        const storedPerms = client.lockedChannels?.get(channelId);
        
        // Restore permissions
        await channel.permissionOverwrites.edit(guild.roles.everyone, {
          SendMessages: storedPerms?.sendMessages ?? null,
          AddReactions: storedPerms?.sendMessages ?? null,
          Connect: storedPerms?.connect ?? null,
          Speak: storedPerms?.connect ?? null
        }, reason);
        
        unlockedCount++;
      } catch (error) {
        console.log(`[Unraid] Error unlocking channel ${channel.name}: ${error.message}`);
      }
    }
    
    // Update lockdown state
    if (client.lockdownState) {
      client.lockdownState.set(guild.id, {
        active: false,
        moderator: interaction.user.tag,
        reason: reason,
        timestamp: Date.now()
      });
    }
    
    console.log(`[Unraid] Disabled in ${guild.name}. ${unlockedCount} channels unlocked.`);
    
    const embed = new EmbedBuilder()
      .setTitle('🔓 Lockdown Disabled')
      .setColor(0x00ff00)
      .addFields(
        { name: 'Channels Unlocked', value: String(unlockedCount), inline: true },
        { name: 'Reason', value: reason, inline: true }
      ));
    
    await interaction.reply({ embeds: [embed] });
    
    // Log to mod log channel
    const logChannel = guild.channels.cache.find(ch => 
      ch.name === 'mod-logs' || ch.name === 'moderation-logs'
    );
    
    if (logChannel) {
      await logChannel.send({ embeds: [embed] });
    }
    
    // Notify in raid log channel if configured
    const config = require('../config').defaultConfig;
    if (config.raid?.logChannel) {
      const raidLogChannel = guild.channels.cache.get(config.raid.logChannel);
      if (raidLogChannel) {
        await raidLogChannel.send({ embeds: [embed] });
      }
    }
  }
};