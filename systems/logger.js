const { EmbedBuilder } = require('discord.js');
const { defaultConfig } = require('../config');

/**
 * Logger System
 * Centralized logging for all bot events
 */
module.exports = function initializeLogger(client) {
  console.log('[Logger] System initialized');
  
  // Listen for events
  setupEventLogging(client);
};

/**
 * Set up event logging
 */
function setupEventLogging(client) {
  // Message logs (edited/deleted)
  client.on('messageDelete', async (message) => {
    await logMessageDelete(message, client);
  });
  
  client.on('messageUpdate', async (oldMessage, newMessage) => {
    await logMessageEdit(oldMessage, newMessage, client);
  });
  
  // Member logs (join/leave/ban/unban)
  client.on('guildMemberRemove', async (member) => {
    await logMemberLeave(member, client);
  });
  
  // Voice logs
  client.on('voiceStateUpdate', async (oldState, newState) => {
    await logVoiceChange(oldState, newState, client);
  });
};

/**
 * Log message deletion
 */
async function logMessageDelete(message, client) {
  if (!message.guild) return;
  
  const config = defaultConfig;
  if (!config.logging?.enabled || !config.logging?.messages) return;
  
  const logChannel = message.guild.channels.cache.get(config.logging.messages);
  if (!logChannel) return;
  
  // Don't log if bot deleted the message (auto-mod)
  if (message.author?.bot) return;
  
  const embed = new EmbedBuilder()
    .setTitle('🗑️ Message Deleted')
    .setColor(0xff0000)
    .setTimestamp()
    .addFields(
      { name: 'Author', value: `${message.author} (${message.author?.id})`, inline: true },
      { name: 'Channel', value: message.channel.toString(), inline: true }
    )
    .setDescription(message.content || '*No text content*');
  
  // Check for attachments
  if (message.attachments.size > 0) {
    embed.addFields({
      name: 'Attachments',
      value: message.attachments.map(a => a.name).join(', ') || 'Unknown'
    });
  }
  
  await logChannel.send({ embeds: [embed] }).catch(() => {});
}

/**
 * Log message edit
 */
async function logMessageEdit(oldMessage, newMessage, client) {
  if (!newMessage.guild) return;
  
  const config = defaultConfig;
  if (!config.logging?.enabled || !config.logging?.messages) return;
  
  const logChannel = newMessage.guild.channels.cache.get(config.logging.messages);
  if (!logChannel) return;
  
  // Don't log bot messages or identical content
  if (oldMessage.author?.bot || oldMessage.content === newMessage.content) return;
  
  const embed = new EmbedBuilder()
    .setTitle('✏️ Message Edited')
    .setColor(0xffaa00)
    .setTimestamp()
    .addFields(
      { name: 'Author', value: `${newMessage.author} (${newMessage.author?.id})`, inline: true },
      { name: 'Channel', value: newMessage.channel.toString(), inline: true }
    )
    .addFields(
      { name: 'Before', value: oldMessage.content?.substring(0, 1024) || '*Empty*', inline: false },
      { name: 'After', value: newMessage.content?.substring(0, 1024) || '*Empty*', inline: false }
    );
  
  await logChannel.send({ embeds: [embed] }).catch(() => {});
}

/**
 * Log member leave
 */
async function logMemberLeave(member, client) {
  const config = defaultConfig;
  if (!config.logging?.enabled || !config.logging?.members) return;
  
  const logChannel = member.guild.channels.cache.get(config.logging.members);
  if (!logChannel) return;
  
  const embed = new EmbedBuilder()
    .setTitle('👋 Member Left')
    .setColor(0xff0000)
    .setTimestamp()
    .addFields(
      { name: 'User', value: `${member.user} (${member.user.id})`, inline: true },
      { name: 'Joined', value: member.joinedAt?.toLocaleString() || 'Unknown', inline: true }
    )
    .setFooter({ text: `Member #${member.guild.memberCount}` });
  
  await logChannel.send({ embeds: [embed] }).catch(() => {});
}

/**
 * Log voice state changes
 */
async function logVoiceChange(oldState, newState, client) {
  if (!newState.guild) return;
  
  const config = defaultConfig;
  if (!config.logging?.enabled || !config.logging?.voice) return;
  
  const logChannel = newState.guild.channels.cache.get(config.logging.voice);
  if (!logChannel) return;
  
  const user = newState.member?.user || newState.client.user;
  const wasInVoice = oldState.channelId;
  const isInVoice = newState.channelId;
  
  // Join
  if (!wasInVoice && isInVoice) {
    const embed = new EmbedBuilder()
      .setTitle('🎤 Voice Joined')
      .setColor(0x00ff00)
      .setTimestamp()
      .addFields(
        { name: 'User', value: `${user} (${user.id})`, inline: true },
        { name: 'Channel', value: newState.channel?.toString() || 'Unknown', inline: true }
      );
    
    return logChannel.send({ embeds: [embed] }).catch(() => {});
  }
  
  // Leave
  if (wasInVoice && !isInVoice) {
    const embed = new EmbedBuilder()
      .setTitle('🎤 Voice Left')
      .setColor(0xff0000)
      .setTimestamp()
      .addFields(
        { name: 'User', value: `${user} (${user.id})`, inline: true },
        { name: 'Channel', value: oldState.channel?.toString() || 'Unknown', inline: true }
      );
    
    return logChannel.send({ embeds: [embed] }).catch(() => {});
  }
  
  // Mute/Deafen status change
  if (wasInVoice && isInVoice) {
    if (oldState.mute !== newState.mute || oldState.deaf !== newState.deaf) {
      const embed = new EmbedBuilder()
        .setTitle('🎛️ Voice Status Changed')
        .setColor(0xffaa00)
        .setTimestamp()
        .addFields(
          { name: 'User', value: `${user} (${user.id})`, inline: true },
          { name: 'Channel', value: newState.channel?.toString() || 'Unknown', inline: true }
        )
        .addFields(
          { name: 'Self Mute', value: newState.mute ? '🔇 Muted' : '🔊 Unmuted', inline: true },
          { name: 'Self Deafen', value: newState.deaf ? '🔇 Deafened' : '🔊 Not Deafened', inline: true }
        );
      
      return logChannel.send({ embeds: [embed] }).catch(() => {});
    }
    
    // Channel switch
    if (oldState.channelId !== newState.channelId) {
      const embed = new EmbedBuilder()
        .setTitle('🔄 Voice Channel Switch')
        .setColor(0xffaa00)
        .setTimestamp()
        .addFields(
          { name: 'User', value: `${user} (${user.id})`, inline: true },
          { name: 'From', value: oldState.channel?.toString() || 'Unknown', inline: true },
          { name: 'To', value: newState.channel?.toString() || 'Unknown', inline: true }
        );
      
      return logChannel.send({ embeds: [embed] }).catch(() => {});
    }
  }
}

/**
 * Log channel create/delete/update
 */
async function logChannelChange(guild, channel, action, client) {
  const config = defaultConfig;
  if (!config.logging?.enabled || !config.logging?.channels) return;
  
  const logChannel = guild.channels.cache.get(config.logging.channels);
  if (!logChannel) return;
  
  const embed = new EmbedBuilder()
    .setTitle(`📝 Channel ${action}`)
    .setColor(action === 'Created' ? 0x00ff00 : 0xff0000)
    .setTimestamp()
    .addFields(
      { name: 'Channel', value: channel.toString(), inline: true },
      { name: 'Type', value: channel.type.toString(), inline: true }
    );
  
  await logChannel.send({ embeds: [embed] }).catch(() => {});
}

module.exports.logChannelChange = logChannelChange;