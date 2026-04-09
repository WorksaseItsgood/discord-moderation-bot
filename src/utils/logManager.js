/**
 * Niotic Log Manager - Centralized logging for all bot actions
 * Provides beautiful embeds for each log category
 */

import { EmbedBuilder, ChannelType } from 'discord.js';
import { getGuildConfig, addRaidActionLog } from '../database/db.js';

const C = {
  success: 0x00ff99,
  error: 0xff4757,
  warning: 0xffa502,
  info: 0x5865F2,
  mod: 0xff6b81,
  raid: 0xff0000,
  shield: 0x9b59b6,
  mute: 0xffd93d,
  server: 0x3498db,
  message: 0x9b59b6,
  voice: 0x1abc9c,
  role: 0xe67e22,
};

// Helper to get or create log channel
async function getOrCreateChannel(guild, channelName, type = ChannelType.GuildText) {
  let channel = guild.channels.cache.find(c => c.name === channelName);
  
  if (!channel) {
    try {
      channel = await guild.channels.create({
        name: channelName,
        type: type,
        permissionOverwrites: [
          {
            id: guild.roles.everyone.id,
            deny: ['ViewChannel', 'SendMessages'],
          },
          {
            id: guild.client.user.id,
            allow: ['ViewChannel', 'SendMessages', 'ReadMessageHistory'],
          },
        ],
      });
    } catch (error) {
      console.error(`[LogManager] Failed to create channel ${channelName}:`, error);
      return null;
    }
  }
  
  return channel;
}

// Helper to get log channel from config
async function getLogChannel(guild, channelType) {
  const config = client?.guildConfigs?.get(guild.id) || getGuildConfig(guild.id);
  const channelMap = {
    modLogChannel: 'mod-logs',
    serverLogChannel: 'server-logs',
    messageLogChannel: 'message-logs',
    raidLogChannel: 'raid-logs',
    voiceLogChannel: 'voice-logs',
    roleLogChannel: 'role-logs',
  };
  const channelName = channelMap[channelType];
  if (!channelName) return null;
  
  // Check if configured channel exists
  if (config[channelType]) {
    const channel = guild.channels.cache.get(config[channelType]);
    if (channel) return channel;
  }
  
  return getOrCreateChannel(guild, channelName);
}

let client = null;
export function setLogClient(c) {
  client = c;
}

// ============ MODERATION LOGS ============
export async function logModeration(guild, action, data) {
  try {
    const channel = await getLogChannel(guild, 'modLogChannel');
    if (!channel) return;

    const emojiMap = {
      ban: '🔨', kick: '🦶', mute: '🔇', unmute: '🔊',
      warn: '⚠️', tempban: '⏱️', softban: '💨', hackban: '🔗',
      timeout: '⏰', strike: '📌', kickall: '💨', massban: '💥',
    };
    const emoji = emojiMap[action] || '⚡';
    const color = action === 'unmute' ? C.mute : C.mod;

    const embed = new EmbedBuilder()
      .setTitle(`${emoji} ${action.charAt(0).toUpperCase() + action.slice(1)} - Action de modération`)
      .setColor(color)
      .setThumbnail(data.target?.displayAvatarURL?.({ size: 256 }) || data.targetUser?.displayAvatarURL?.({ size: 256 }))
      .addFields(
        { name: '👤 Utilisateur', value: `${data.target?.tag || data.targetUser?.tag || 'Unknown'}\n\`${data.target?.id || data.targetUser?.id || 'Unknown'}\``, inline: true },
        { name: '🛡️ Modérateur', value: data.moderator?.tag || 'System', inline: true },
        { name: '📝 Raison', value: data.reason || 'Non spécifiée', inline: false }
      )
      .setFooter({ text: `Niotic Moderation • ${new Date().toLocaleString('fr-FR')}` })
      .setTimestamp();

    if (data.duration) {
      embed.addFields({ name: '⏱️ Durée', value: data.duration, inline: true });
    }
    if (data.points) {
      embed.addFields({ name: '📊 Points', value: String(data.points), inline: true });
    }
    if (data.extra) {
      embed.addFields({ name: '📌 Extra', value: String(data.extra), inline: false });
    }

    await channel.send({ embeds: [embed] });
  } catch (error) {
    console.error('[LogManager] logModeration error:', error);
  }
}

// ============ SERVER LOGS ============
export async function logServer(guild, action, data) {
  try {
    const channel = await getLogChannel(guild, 'serverLogChannel');
    if (!channel) return;

    const emojiMap = {
      join: '✅', leave: '🚪', roleAdd: '➕', roleRemove: '➖',
      channelCreate: '📁', channelDelete: '🗑️', channelUpdate: '✏️',
      emojiCreate: '😀', emojiDelete: '😢', roleCreate: '🎭',
      roleUpdate: '📝', roleDelete: '🎭', memberUpdate: '👤',
    };
    const emoji = emojiMap[action] || '📋';

    const embed = new EmbedBuilder()
      .setTitle(`${emoji} ${action.charAt(0).toUpperCase() + action.slice(1)} - Événement serveur`)
      .setColor(C.server)
      .setTimestamp()
      .setFooter({ text: `Niotic Moderation • ${new Date().toLocaleString('fr-FR')}` });

    if (data.user) {
      embed.setThumbnail(data.user.displayAvatarURL?.({ size: 256 }));
      embed.addFields({ name: '👤 Utilisateur', value: `${data.user.tag}\n\`${data.user.id}\``, inline: true });
    }

    if (data.description) {
      embed.addFields({ name: '📝 Détails', value: data.description, inline: false });
    }

    if (data.extra) {
      embed.addFields({ name: '📌 Extra', value: String(data.extra), inline: true });
    }

    await channel.send({ embeds: [embed] });
  } catch (error) {
    console.error('[LogManager] logServer error:', error);
  }
}

// ============ MESSAGE LOGS ============
export async function logMessage(guild, action, data) {
  try {
    const channel = await getLogChannel(guild, 'messageLogChannel');
    if (!channel) return;

    const emojiMap = {
      delete: '🗑️', edit: '✏️', purge: '🧹', bulkDelete: '💥',
    };
    const emoji = emojiMap[action] || '💬';

    const embed = new EmbedBuilder()
      .setTitle(`${emoji} Message ${action === 'delete' ? 'supprimé' : action === 'edit' ? 'modifié' : 'modifié'}`)
      .setColor(C.message)
      .setTimestamp()
      .setFooter({ text: `Niotic Moderation • ${new Date().toLocaleString('fr-FR')}` });

    if (data.user) {
      embed.setThumbnail(data.user.displayAvatarURL?.({ size: 256 }));
      embed.addFields({ name: '👤 Auteur', value: `${data.user.tag}\n\`${data.user.id}\``, inline: true });
    }

    if (data.channel) {
      embed.addFields({ name: '💬 Salon', value: `${data.channel}`, inline: true });
    }

    if (data.content) {
      embed.addFields({ name: '📝 Contenu', value: data.content.substring(0, 1024), inline: false });
    }

    if (data.oldContent && action === 'edit') {
      embed.addFields({ name: '✏️ Ancien contenu', value: data.oldContent.substring(0, 1024), inline: false });
      embed.addFields({ name: '📝 Nouveau contenu', value: data.newContent?.substring(0, 1024) || 'Vide', inline: false });
    }

    if (data.count) {
      embed.addFields({ name: '🧹 Nombre de messages', value: String(data.count), inline: true });
    }

    await channel.send({ embeds: [embed] });
  } catch (error) {
    console.error('[LogManager] logMessage error:', error);
  }
}

// ============ RAID LOGS ============
export async function logRaid(guild, action, data) {
  try {
    const channel = await getLogChannel(guild, 'raidLogChannel');
    if (!channel) return;

    const emojiMap = {
      raidStart: '🚨', raidEnd: '✅', raidAutoKick: '🦶',
      raidQuarantine: '🔒', raidConfig: '⚙️', raidThreshold: '📊',
      raidDerank: '📉', raidUnlock: '🔓', raidLock: '🔒',
    };
    const emoji = emojiMap[action] || '🛡️';
    const color = action.includes('Derank') || action.includes('Quarantine') ? C.error : C.raid;

    const embed = new EmbedBuilder()
      .setTitle(`${emoji} Raid Event - ${action.charAt(0).toUpperCase() + action.slice(1)}`)
      .setColor(color)
      .setTimestamp()
      .setFooter({ text: `Niotic Moderation • ${new Date().toLocaleString('fr-FR')}` });

    if (data.triggeredBy) {
      embed.addFields({ name: '🛡️ Déclenché par', value: data.triggeredBy, inline: true });
    }

    if (data.target) {
      embed.addFields({ name: '👤 Cible', value: `${data.target?.tag || data.target}\n\`${data.target?.id || 'N/A'}\``, inline: true });
    }

    if (data.reason) {
      embed.addFields({ name: '📝 Raison', value: data.reason, inline: false });
    }

    if (data.threshold) {
      embed.addFields({ name: '📊 Seuil', value: String(data.threshold), inline: true });
    }

    if (data.joinSpeed) {
      embed.addFields({ name: '⚡ Vitesse de join', value: data.joinSpeed, inline: true });
    }

    if (data.count) {
      embed.addFields({ name: '📌 Count', value: String(data.count), inline: true });
    }

    if (data.duration) {
      embed.addFields({ name: '⏱️ Durée', value: data.duration, inline: true });
    }

    // Store in database for raid action log
    try {
      await addRaidActionLog(guild.id, {
        type: action,
        triggeredBy: data.triggeredBy || 'system',
        targetId: data.target?.id || null,
        reason: data.reason || null,
        threshold: data.threshold || null,
        joinSpeed: data.joinSpeed || null,
        count: data.count || null,
        duration: data.duration || null,
      });
    } catch (e) {
      console.error('[LogManager] Failed to add raid action log:', e);
    }

    await channel.send({ embeds: [embed] });
  } catch (error) {
    console.error('[LogManager] logRaid error:', error);
  }
}

// ============ VOICE LOGS ============
export async function logVoice(guild, action, data) {
  try {
    const channel = await getLogChannel(guild, 'voiceLogChannel');
    if (!channel) return;

    const emojiMap = {
      join: '🔊', leave: '🔇', mute: '🔇', unmute: '🔊',
      deafen: '🙊', undeafen: '🎧', disconnect: '🔌',
      move: '➡️', voiceUpdate: '🔄',
    };
    const emoji = emojiMap[action] || '🎤';

    const embed = new EmbedBuilder()
      .setTitle(`${emoji} Voice Event - ${action.charAt(0).toUpperCase() + action.slice(1)}`)
      .setColor(C.voice)
      .setTimestamp()
      .setFooter({ text: `Niotic Moderation • ${new Date().toLocaleString('fr-FR')}` });

    if (data.user) {
      embed.setThumbnail(data.user.displayAvatarURL?.({ size: 256 }));
      embed.addFields({ name: '👤 Utilisateur', value: `${data.user.tag}\n\`${data.user.id}\``, inline: true });
    }

    if (data.channel) {
      embed.addFields({ name: '🔊 Salon vocal', value: data.channel, inline: true });
    }

    if (data.oldChannel) {
      embed.addFields({ name: '⬅️ Ancien salon', value: data.oldChannel, inline: true });
    }

    if (data.newChannel) {
      embed.addFields({ name: '➡️ Nouveau salon', value: data.newChannel, inline: true });
    }

    await channel.send({ embeds: [embed] });
  } catch (error) {
    console.error('[LogManager] logVoice error:', error);
  }
}

// ============ ROLE LOGS ============
export async function logRole(guild, action, data) {
  try {
    const channel = await getLogChannel(guild, 'roleLogChannel');
    if (!channel) return;

    const emojiMap = {
      add: '➕', remove: '➖', create: '✨', update: '✏️',
      delete: '🗑️', massAdd: '➕➕➕', massRemove: '➖➖➖',
    };
    const emoji = emojiMap[action] || '🎭';

    const embed = new EmbedBuilder()
      .setTitle(`${emoji} Role Event - ${action.charAt(0).toUpperCase() + action.slice(1)}`)
      .setColor(C.role)
      .setTimestamp()
      .setFooter({ text: `Niotic Moderation • ${new Date().toLocaleString('fr-FR')}` });

    if (data.user) {
      embed.setThumbnail(data.user.displayAvatarURL?.({ size: 256 }));
      embed.addFields({ name: '👤 Utilisateur', value: `${data.user.tag}\n\`${data.user.id}\``, inline: true });
    }

    if (data.role) {
      embed.addFields({ name: '🎭 Rôle', value: `${data.role.name}\n\`${data.role.id}\``, inline: true });
    }

    if (data.moderator) {
      embed.addFields({ name: '🛡️ Modérateur', value: data.moderator.tag, inline: true });
    }

    if (data.description) {
      embed.addFields({ name: '📝 Détails', value: data.description, inline: false });
    }

    if (data.count) {
      embed.addFields({ name: '👥 Nombre de rôles', value: String(data.count), inline: true });
    }

    await channel.send({ embeds: [embed] });
  } catch (error) {
    console.error('[LogManager] logRole error:', error);
  }
}

// ============ SHIELD LOGS ============
export async function logShield(guild, action, data) {
  try {
    const channel = await getLogChannel(guild, 'raidLogChannel');
    if (!channel) return;

    const emojiMap = {
      enable: '✅', disable: '❌', trigger: '🚨',
      antiSpam: '🛡️', antiRaid: '🚨', autoMod: '⚡',
    };
    const emoji = emojiMap[action] || '🛡️';

    const embed = new EmbedBuilder()
      .setTitle(`${emoji} Shield - ${action.charAt(0).toUpperCase() + action.slice(1)}`)
      .setColor(C.shield)
      .setTimestamp()
      .setFooter({ text: `Niotic Moderation • ${new Date().toLocaleString('fr-FR')}` });

    if (data.description) {
      embed.addFields({ name: '📝 Détails', value: data.description, inline: false });
    }

    if (data.extra) {
      embed.addFields({ name: '📌 Extra', value: String(data.extra), inline: true });
    }

    await channel.send({ embeds: [embed] });
  } catch (error) {
    console.error('[LogManager] logShield error:', error);
  }
}

// ============ ANTIBOT LOGS ============
export async function logAntibot(guild, action, data) {
  try {
    const channel = await getLogChannel(guild, 'raidLogChannel');
    if (!channel) return;

    const emojiMap = {
      botKick: '🤖', botDerank: '📉', botWhitelistAdd: '➕', botWhitelistRemove: '➖',
      botDetected: '🚨', botAllowed: '✅', antibotToggle: '⚙️',
    };
    const emoji = emojiMap[action] || '🤖';
    const color = action.includes('Kick') || action.includes('Derank') ? C.error : C.shield;

    const embed = new EmbedBuilder()
      .setTitle(`${emoji} Anti-Bot Event - ${action.charAt(0).toUpperCase() + action.slice(1)}`)
      .setColor(color)
      .setTimestamp()
      .setFooter({ text: `Niotic Moderation • ${new Date().toLocaleString('fr-FR')}` });

    if (data.bot) {
      embed.setThumbnail(data.bot.displayAvatarURL?.({ size: 256 }));
      embed.addFields({ name: '🤖 Bot', value: `${data.bot.tag}\n\`${data.bot.id}\``, inline: true });
    }

    if (data.inviter) {
      embed.addFields({ name: '👤 Inviteur', value: `${data.inviter.tag}\n\`${data.inviter.id}\``, inline: true });
    }

    if (data.reason) {
      embed.addFields({ name: '📝 Raison', value: data.reason, inline: false });
    }

    if (data.whitelist) {
      embed.addFields({ name: '📋 Whitelist', value: data.whitelist, inline: false });
    }

    await channel.send({ embeds: [embed] });
  } catch (error) {
    console.error('[LogManager] logAntibot error:', error);
  }
}

// ============ RAID ACTION LOGS ============
export async function logRaidAction(guild, userId, action, details) {
  try {
    const channel = await getLogChannel(guild, 'raidLogChannel');
    if (!channel) return;

    const emojiMap = {
      derank: '📉', kick: '🦶', ban: '🔨', mute: '🔇', quarantine: '🔒',
      channelCreate: '📁', channelDelete: '🗑️', spam: '💬', botAdd: '🤖',
    };
    const emoji = emojiMap[action] || '🛡️';
    const color = action === 'derank' ? C.error : C.raid;

    const embed = new EmbedBuilder()
      .setTitle(`${emoji} Raid Action - ${action.charAt(0).toUpperCase() + action.slice(1)}`)
      .setColor(color)
      .setTimestamp()
      .setFooter({ text: `Niotic Moderation • ${new Date().toLocaleString('fr-FR')}` });

    if (details.target) {
      embed.setThumbnail(details.target.displayAvatarURL?.({ size: 256 }));
      embed.addFields({ name: '👤 Utilisateur', value: `${details.target.tag || details.target}\n\`${details.target.id || userId}\``, inline: true });
    } else if (userId) {
      embed.addFields({ name: '👤 Utilisateur ID', value: `\`${userId}\``, inline: true });
    }

    if (details.moderator) {
      embed.addFields({ name: '🛡️ Modérateur', value: details.moderator, inline: true });
    }

    if (details.reason) {
      embed.addFields({ name: '📝 Raison', value: details.reason, inline: false });
    }

    if (details.count) {
      embed.addFields({ name: '📊 Count', value: String(details.count), inline: true });
    }

    if (details.threshold) {
      embed.addFields({ name: '⚠️ Seuil', value: String(details.threshold), inline: true });
    }

    if (details.rolesRemoved) {
      embed.addFields({ name: '🎭 Rôles supprimés', value: details.rolesRemoved, inline: false });
    }

    if (details.extra) {
      embed.addFields({ name: '📌 Extra', value: String(details.extra), inline: true });
    }

    await channel.send({ embeds: [embed] });
  } catch (error) {
    console.error('[LogManager] logRaidAction error:', error);
  }
}

// ============ DERANK LOGS ============
export async function logDerank(guild, data) {
  try {
    const channel = await getLogChannel(guild, 'raidLogChannel');
    if (!channel) return;

    const embed = new EmbedBuilder()
      .setTitle('📉 Derank - Rôles supprimés')
      .setColor(C.error)
      .setThumbnail(data.target?.displayAvatarURL?.({ size: 256 }))
      .addFields(
        { name: '👤 Utilisateur', value: `${data.target?.tag || 'Unknown'}\n\`${data.target?.id || 'Unknown'}\``, inline: true },
        { name: '📝 Raison', value: data.reason || 'Non spécifiée', inline: false }
      )
      .setFooter({ text: `Niotic Moderation • ${new Date().toLocaleString('fr-FR')}` })
      .setTimestamp();

    if (data.roles) {
      embed.addFields({ name: '🎭 Rôles supprimés', value: data.roles, inline: false });
    }

    await channel.send({ embeds: [embed] });
  } catch (error) {
    console.error('[LogManager] logDerank error:', error);
  }
}

export default {
  setLogClient,
  logModeration,
  logServer,
  logMessage,
  logRaid,
  logVoice,
  logRole,
  logShield,
  logDerank,
  logAntibot,
  logRaidAction,
  colors: C,
};
