/**
 * Embed Builder Utility - Consistent embed design across all commands
 */

import { EmbedBuilder } from 'discord.js';

export const Colors = {
  success: 0x00ff00,
  error: 0xff0000,
  warning: 0xffaa00,
  info: 0x5865F2,
  moderation: 0xff6600,
  raid: 0xff0000,
};

export function successEmbed(title, description) {
  return new EmbedBuilder()
    .setTitle(`✅ ${title}`)
    .setColor(Colors.success)
    .setDescription(description)
    .setTimestamp();
}

export function errorEmbed(title, description) {
  return new EmbedBuilder()
    .setTitle(`❌ ${title}`)
    .setColor(Colors.error)
    .setDescription(description)
    .setTimestamp();
}

export function warningEmbed(title, description) {
  return new EmbedBuilder()
    .setTitle(`⚠️ ${title}`)
    .setColor(Colors.warning)
    .setDescription(description)
    .setTimestamp();
}

export function infoEmbed(title, description) {
  return new EmbedBuilder()
    .setTitle(`ℹ️ ${title}`)
    .setColor(Colors.info)
    .setDescription(description)
    .setTimestamp();
}

export function modEmbed(title, fields = []) {
  const embed = new EmbedBuilder()
    .setTitle(title)
    .setColor(Colors.moderation)
    .setTimestamp();

  for (const field of fields) {
    embed.addFields(field);
  }

  return embed;
}

export function raidEmbed(title, description, fields = []) {
  const embed = new EmbedBuilder()
    .setTitle(`🚨 ${title}`)
    .setColor(Colors.raid)
    .setDescription(description)
    .setTimestamp();

  for (const field of fields) {
    embed.addFields(field);
  }

  return embed;
}

export function confirmationEmbed(title, description, components) {
  return {
    embeds: [
      new EmbedBuilder()
        .setTitle(`⚠️ ${title}`)
        .setColor(Colors.warning)
        .setDescription(description)
        .setTimestamp(),
    ],
    components,
  };
}

export function paginationEmbed(items, page = 1, perPage = 10, title = 'Results') {
  const totalPages = Math.ceil(items.length / perPage);
  const start = (page - 1) * perPage;
  const end = start + perPage;
  const pageItems = items.slice(start, end);

  const embed = new EmbedBuilder()
    .setTitle(title)
    .setColor(Colors.info)
    .setDescription(pageItems.join('\n'))
    .setFooter({ text: `Page ${page}/${totalPages} | Total: ${items.length}` })
    .setTimestamp();

  return embed;
}
