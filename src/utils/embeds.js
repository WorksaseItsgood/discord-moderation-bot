/**
 * Niotic Embed Builder - Beautiful, consistent embeds
 */

import { EmbedBuilder } from 'discord.js';

const C = {
  success: 0x00ff99,
  error: 0xff4757,
  warning: 0xffa502,
  info: 0x5865F2,
  mod: 0xff6b81,
  raid: 0xff0000,
  shield: 0x9b59b6,
  mute: 0xffd93d,
};

function base(type = 'info') {
  return new EmbedBuilder()
    .setColor(C[type] || C.info)
    .setTimestamp();
}

export function success(title, desc) {
  return base('success').setTitle(`✅ ${title}`).setDescription(desc);
}

export function error(title, desc) {
  return base('error').setTitle(`❌ ${title}`).setDescription(desc);
}

export function warn(title, desc) {
  return base('warning').setTitle(`⚠️ ${title}`).setDescription(desc);
}

export function info(title, desc) {
  return base('info').setTitle(`ℹ️ ${title}`).setDescription(desc);
}

// Moderation embeds with thumbnail
export function modAction(action, target, moderator, reason, client, extra = {}) {
  const emojiMap = { ban: '🔨', kick: '🦶', mute: '🔇', warn: '⚠️', tempban: '⏱️', softban: '💨', kick: '🦶' };
  const emoji = emojiMap[action] || '⚡';

  const embed = base('mod')
    .setTitle(`${emoji} ${action.charAt(0).toUpperCase() + action.slice(1)} - Action enregistrée`)
    .setThumbnail(target.displayAvatarURL({ size: 256 }))
    .addFields(
      { name: '👤 Utilisateur', value: `${target.tag}\n\`${target.id}\``, inline: true },
      { name: '🛡️ Modérateur', value: moderator.tag, inline: true },
      { name: '📝 Raison', value: reason || 'Non spécifiée', inline: false }
    );

  if (extra.duration) {
    embed.addFields({ name: '⏱️ Durée', value: extra.duration, inline: true });
  }
  if (extra.points) {
    embed.addFields({ name: '📊 Points', value: String(extra.points), inline: true });
  }

  embed.setFooter({ text: `Niotic Moderation • ${new Date().toLocaleString('fr-FR')}` });
  return embed;
}

export function confirmation(title, description, confirmId, cancelId, color = C.warning) {
  const embed = new EmbedBuilder()
    .setTitle(`⚠️ ${title}`)
    .setColor(color)
    .setDescription(description)
    .setFooter({ text: 'Niotic Moderation' })
    .setTimestamp();

  const { ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
  const confirmBtn = new ButtonBuilder().setCustomId(confirmId).setLabel('✅ Confirmer').setStyle(ButtonStyle.Danger);
  const cancelBtn = new ButtonBuilder().setCustomId(cancelId).setLabel('❌ Annuler').setStyle(ButtonStyle.Secondary);
  const row = new ActionRowBuilder().addComponents(confirmBtn, cancelBtn);

  return { embeds: [embed], components: [row] };
}

export function paginatedList(items, page, perPage, title, color = C.info) {
  const total = Math.ceil(items.length / perPage);
  const start = (page - 1) * perPage;
  const slice = items.slice(start, start + perPage);

  const embed = new EmbedBuilder()
    .setTitle(title)
    .setColor(color)
    .setDescription(slice.join('\n') || 'Aucun résultat')
    .setFooter({ text: `Page ${page}/${total} • ${items.length} total • Niotic` })
    .setTimestamp();

  return embed;
}

export function userInfo(user, member, client) {
  const joinDays = member ? Math.floor((Date.now() - member.joinedTimestamp) / 86400000) : null;
  const accDays = Math.floor((Date.now() - user.createdTimestamp) / 86400000);

  const embed = base('info')
    .setTitle(`👤 ${user.tag}`)
    .setThumbnail(user.displayAvatarURL({ size: 256 }))
    .addFields(
      { name: '📅 Compte créé', value: `Il y a ${accDays} jour(s)`, inline: true },
      { name: '📥 Rejoint le serveur', value: joinDays ? `Il y a ${joinDays} jour(s)` : 'Membre introuvable', inline: true },
      { name: '🏷️ ID', value: `\`${user.id}\``, inline: true }
    );

  if (member) {
    const roles = member.roles.cache.filter(r => r.name !== '@everyone');
    embed.addFields({ name: `🎭 Rôles (${roles.size})`, value: roles.size > 0 ? roles.map(r => r.toString()).slice(0, 10).join(', ') : 'Aucun', inline: false });
    embed.addFields({ name: '⏱️ Timeout', value: member.isCommunicationDisabled() ? `Jusqu'au ${new Date(member.communicationDisabledUntil).toLocaleString('fr-FR')}` : 'Aucune', inline: true });
  }

  embed.setFooter({ text: 'Niotic Moderation' });
  return embed;
}

export function serverInfo(guild) {
  const embed = base('info')
    .setTitle(`🏠 ${guild.name}`)
    .setThumbnail(guild.iconURL({ size: 256 }))
    .addFields(
      { name: '👥 Membres', value: String(guild.memberCount), inline: true },
      { name: '📁 Salons', value: String(guild.channels.cache.size), inline: true },
      { name: '🏷️ Rôles', value: String(guild.roles.cache.size), inline: true },
      { name: '✨ Boost Level', value: `Niveau ${guild.premiumTier}`, inline: true },
      { name: '🌐 Région', value: guild.preferredLocale, inline: true },
      { name: '🆔 Serveur ID', value: `\`${guild.id}\``, inline: true }
    )
    .setFooter({ text: 'Niotic Moderation' });
  return embed;
}

export function shieldStatus(config, raidState, guildId, client) {
  const embed = base('shield')
    .setTitle('🛡️ Shield Status')
    .setThumbnail(client.user.displayAvatarURL())
    .addFields(
      { name: 'UltraShield', value: config.shieldEnabled !== false ? '✅ Actif' : '❌ Désactivé', inline: true },
      { name: 'Anti-Spam', value: config.antiSpamEnabled !== false ? '✅ Actif' : '❌ Désactivé', inline: true },
      { name: 'Anti-Raid', value: config.antiRaidEnabled !== false ? '✅ Actif' : '❌ Désactivé', inline: true },
      { name: 'AutoMod', value: config.autoModEnabled !== false ? '✅ Actif' : '❌ Désactivé', inline: true },
      { name: 'Raid Mode', value: raidState?.active ? '🔒 ACTIF' : '🟢 Inactif', inline: true },
      { name: 'Seuil Raid', value: String(config.raidThreshold || 5), inline: true }
    )
    .setFooter({ text: 'Niotic Moderation' });
  return embed;
}

export { C as colors };
export default { success, error, warn, info, modAction, confirmation, paginatedList, userInfo, serverInfo, shieldStatus, colors: C };
