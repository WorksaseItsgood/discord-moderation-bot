/**
 * Welcome System - Custom welcome messages
 * Handles member joins with custom messages, images, auto-role, and member counter
 */

module.exports = (client) => {
  // Store welcome configs per guild
  client.welcomeConfigs = new Map();
  
  /**
   * Configure welcome system for a guild
   */
  client.setWelcomeConfig = async (guildId, config) => {
    client.welcomeConfigs.set(guildId, {
      enabled: config.enabled !== false,
      channelId: config.channelId,
      message: config.message || 'Welcome {user} to {server}!',
      embed: config.embed !== false,
      autoRole: config.autoRole,
      memberCount: config.memberCount !== false,
      // Image generation options
      image: config.image !== false,
      background: config.background || 'default',
      textColor: config.textColor || '#ffffff',
      font: config.font || 'default'
    });
    
    // Save to database
    if (client.dbManager) {
      client.dbManager.setSetting('welcome_config', guildId, config);
    }
  };
  
  /**
   * Get welcome config for a guild
   */
  client.getWelcomeConfig = (guildId) => {
    return client.welcomeConfigs.get(guildId);
  };
  
  /**
   * Send welcome message for a new member
   */
  client.sendWelcomeMessage = async (member) => {
    const config = client.getWelcomeConfig(member.guild.id);
    
    if (!config || !config.enabled || !config.channelId) {
      return;
    }
    
    const channel = member.guild.channels.cache.get(config.channelId);
    
    if (!channel) {
      return;
    }
    
    // Parse message with placeholders
    let message = config.message
      .replace(/{user}/g, member.user.toString())
      .replace(/{username}/g, member.user.username)
      .replace(/{server}/g, member.guild.name)
      .replace(/{membercount}/g, member.guild.memberCount)
      .replace(/{mention}/g, member.toString());
    
    // Create embed if enabled
    if (config.embed) {
      const { EmbedBuilder } = require('discord.js');
      
      const embed = new EmbedBuilder()
        .setColor(0x00ff00)
        .setDescription(message)
        .setThumbnail(member.user.displayAvatarURL({ size: 256 }))
        .setFooter({ text: `Member #${member.guild.memberCount}` });
      
      try {
        await channel.send({ embeds: [embed] });
      } catch (e) {
        console.error('[Welcome] Error sending embed:', e);
      }
    } else {
      try {
        await channel.send(message);
      } catch (e) {
        console.error('[Welcome] Error sending message:', e);
      }
    }
    
    // Auto-role
    if (config.autoRole) {
      try {
        const role = member.guild.roles.cache.get(config.autoRole);
        if (role) {
          await member.roles.add(role);
          console.log(`[Welcome] Auto-role ${role.name} added to ${member.user.tag}`);
        }
      } catch (e) {
        console.error('[Welcome] Error adding auto-role:', e);
      }
    }
    
    // Update member count if enabled
    if (config.memberCount) {
      try {
        const countChannel = member.guild.channels.cache.find(ch => 
          ch.name.includes('members') || ch.name.includes('count')
        );
        
        if (countChannel) {
          await countChannel.setName(`Members: ${member.guild.memberCount}`);
        }
      } catch (e) {
        console.error('[Welcome] Error updating member count:', e);
      }
    }
  };
  
  /**
   * Send leave message when a member leaves
   */
  client.sendLeaveMessage = async (member) => {
    const config = client.getWelcomeConfig(member.guild.id);
    
    if (!config || !config.enabled || !config.leaveChannelId) {
      return;
    }
    
    const channel = member.guild.channels.cache.get(config.leaveChannelId);
    
    if (!channel) {
      return;
    }
    
    // Parse message with placeholders
    let message = config.leaveMessage
      .replace(/{user}/g, member.user.toString())
      .replace(/{username}/g, member.user.username)
      .replace(/{server}/g, member.guild.name)
      .replace(/{membercount}/g, member.guild.memberCount);
    
    const { EmbedBuilder } = require('discord.js');
    
    const embed = new EmbedBuilder()
      .setColor(0xff0000)
      .setDescription(message)
      .setFooter({ text: `Member #${member.guild.memberCount}` });
    
    try {
      await channel.send({ embeds: [embed] });
    } catch (e) {
      console.error('[Welcome] Error sending leave message:', e);
    }
  };
  
  console.log('[System] Welcome system initialized');
  
  return client;
};