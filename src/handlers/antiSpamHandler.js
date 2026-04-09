/**
 * Anti-Spam Handler
 */

import { EmbedBuilder } from 'discord.js';

export function setupAntiSpam(client) {
  client.antiSpam = new Map();
  client.logger.info('[AntiSpam] Initialized');
}

export async function checkSpam(message, client) {
  if (message.author.bot) return;
  if (!message.guild) return;

  const guildId = message.guild.id;
  const userId = message.author.id;

  const config = client.guildConfigs.get(guildId) || {};
  if (!config.antiSpamEnabled) return;

  // Check whitelist
  try {
    const { getWhitelist } = await import('../database/db.js');
    const whitelist = await getWhitelist(guildId);
    if (whitelist.users?.includes(userId)) return;
  } catch {}

  // Initialize tracker
  if (!client.antiSpam.has(guildId)) client.antiSpam.set(guildId, new Map());
  const tracker = client.antiSpam.get(guildId);

  if (!tracker.has(userId)) {
    tracker.set(userId, { messages: [], lastReset: Date.now() });
  }

  const userData = tracker.get(userId);
  const now = Date.now();

  // Clean old
  if (now - userData.lastReset > 60000) {
    userData.messages = [];
    userData.lastReset = now;
  }

  userData.messages.push({ content: message.content, timestamp: now });

  // Check flood
  const recent = userData.messages.filter(m => now - m.timestamp < 5000);
  if (recent.length > 5) {
    await message.delete().catch(() => {});
    await message.member?.timeout(60000, 'Spam flood').catch(() => {});
    await message.channel.send({ content: `⚠️ <@${userId}>, spam détecté!`, ephemeral: false }).then(m => setTimeout(() => m.delete().catch(() => {}), 3000));
    return;
  }
}
