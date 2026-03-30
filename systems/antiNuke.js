/**
 * Anti-Nuke System - Detect and prevent server raids/destruction
 * Mass channel delete, mass role delete, etc.
 */

module.exports = (client) => {
  // Store nuke configs
  client.nukeConfigs = new Map();
  
  /**
   * Configure anti-nuke for a guild
   */
  client.setNukeConfig = async (guildId, config) => {
    client.nukeConfigs.set(guildId, {
      enabled: config.enabled !== false,
      // Mass channel delete detection
      maxChannelDelete: config.maxChannelDelete || 5,
      channelDeleteWindow: config.channelDeleteWindow || 60000, // 1 minute
      channelDeleteAction: config.channelDeleteAction || 'ban',
      // Mass role delete detection  
      maxRoleDelete: config.maxRoleDelete || 3,
      roleDeleteWindow: config.roleDeleteWindow || 60000,
      roleDeleteAction: config.roleDeleteAction || 'ban',
      // Mass kick detection
      maxKick: config.maxKick || 10,
      kickWindow: config.kickWindow || 60000,
      kickAction: config.kickAction || 'ban',
      // Mass ban detection
      maxBan: config.maxBan || 10,
      banWindow: config.banWindow || 60000,
      banAction: config.banAction || 'ban'
    });
    
    if (client.dbManager) {
      client.dbManager.setSetting('nuke_config', guildId, config);
    }
  };
  
  /**
   * Get anti-nuke config
   */
  client.getNukeConfig = (guildId) => {
    return client.nukeConfigs.get(guildId);
  };
  
  /**
   * Check and log suspicious action
   */
  client.checkNukeAction = async (guild, action, count, moderator, config) => {
    if (!config || !config.enabled) return;
    
    const logChannelId = client.dbManager.getSetting('log_channel', guild.id);
    const logChannel = logChannelId ? guild.channels.cache.get(logChannelId) : null;
    
    const { EmbedBuilder } = require('discord.js');
    
    const embed = new EmbedBuilder()
      .setTitle('⚠️ Anti-Nuke Alert')
      .setColor(0xff0000)
      .addFields(
        { name: '🚨 Action', value: action },
        { name: '📊 Count', value: `${count}` },
        { name: '👤 Moderator', value: moderator?.toString() || 'Unknown' }
      );
    
    if (logChannel) {
      await logChannel.send({ embeds: [embed] });
    }
    
    // Take action against the moderator
    if (moderator) {
      try {
        switch (config[`${action}Action`]) {
          case 'ban':
            await moderator.ban({ reason: `Anti-Nuke: ${action}` });
            break;
          case 'kick':
            await moderator.kick({ reason: `Anti-Nuke: ${action}` });
            break;
          case 'mute':
            // Mute logic would go here
            break;
        }
      } catch (e) {
        console.error('[Anti-Nuke] Action failed:', e);
      }
    }
  };
  
  console.log('[System] Anti-Nuke system initialized');
  
  return client;
};