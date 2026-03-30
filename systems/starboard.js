/**
 * Starboard System - Star messages
 */

module.exports = (client) => {
  // Store starboard configs
  client.starboardConfigs = new Map();
  
  /**
   * Configure starboard for a guild
   */
  client.setStarboardConfig = async (guildId, config) => {
    client.starboardConfigs.set(guildId, {
      enabled: config.enabled !== false,
      channelId: config.channelId,
      threshold: config.threshold || 3,
      emoji: config.emoji || '⭐'
    });
    
    if (client.dbManager) {
      client.dbManager.setSetting('starboard_config', guildId, config);
    }
  };
  
  /**
   * Get starboard config
   */
  client.getStarboardConfig = (guildId) => {
    return client.starboardConfigs.get(guildId);
  };
  
  /**
   * Handle star reaction
   */
  client.handleStarReaction = async (messageReaction, user) => {
    if (user.bot) return;
    
    const message = messageReaction.message;
    const guildId = message.guildId;
    const config = client.getStarboardConfig(guildId);
    
    if (!config || !config.enabled || !config.channelId) return;
    
    // Check emoji
    const emoji = config.emoji === '⭐' ? '⭐' : config.emoji;
    if (messageReaction.emoji.name !== emoji) return;
    
    // Get star count
    const starCount = messageReaction.count;
    
    if (starCount >= config.threshold) {
      // Star the message
      const starData = client.dbManager.starMessage(message.id, message.channelId, guildId, user.id);
      
      // Send to starboard channel
      const starChannel = message.guild.channels.cache.get(config.channelId);
      
      if (starChannel) {
        const { EmbedBuilder } = require('discord.js');
        
        const embed = new EmbedBuilder()
          .setColor(0xffd700)
          .setDescription(message.content.substring(0, 2000))
          .setAuthor({
            name: message.author.tag,
            iconURL: message.author.displayAvatarURL()
          })
          .addFields(
            { name: '📍 Channel', value: message.channel.toString(), inline: true },
            { name: '⭐ Stars', value: `${starCount}`, inline: true },
            { name: '🔗 Link', value: `[Jump](${message.url})`, inline: true }
          )
          .setTimestamp(message.createdTimestamp);
        
        if (message.attachments.size > 0) {
          const attachment = message.attachments.first();
          if (attachment.contentType?.startsWith('image/')) {
            embed.setImage(attachment.url);
          }
        }
        
        await starChannel.send({ embeds: [embed] });
      }
    }
  };
  
  console.log('[System] Starboard system initialized');
  
  return client;
};