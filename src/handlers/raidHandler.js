/**
 * Raid Handler - Anti-raid protection system
 */

import { EmbedBuilder } from 'discord.js';

let lockedChannels = new Map();
let quarantineRoles = new Map();

export function setupRaidHandler(client) {
  client.raidMode = client.raidMode || new Map();
  client.joinTracker = client.joinTracker || new Map();
  client.logger.info('[RaidHandler] Initialized');
}

export async function enableRaidMode(guild, triggeredBy, client, type = 'manual') {
  client.raidMode.set(guild.id, {
    active: true,
    type,
    timestamp: Date.now(),
    triggeredBy,
  });

  const channels = guild.channels.cache.filter(c => c.type === 0 || c.type === 2 || c.type === 15);
  let count = 0;

  for (const [channelId, channel] of channels) {
    try {
      const perms = channel.permissionOverwrites.cache.get(guild.roles.everyone.id);
      lockedChannels.set(`${guild.id}:${channelId}`, {
        sendMessages: perms?.allow.has('SendMessages') ?? true,
        connect: perms?.allow.has('Connect') ?? true,
      });
      await channel.permissionOverwrites.edit(guild.roles.everyone, {
        SendMessages: false,
        AddReactions: false,
        Connect: false,
        Speak: false,
      }, 'Raid mode enabled');
      count++;
    } catch {}
  }

  // Send alert
  const logChannel = guild.channels.cache.find(c => c.name === 'mod-logs' || c.name === 'anti-raid-logs');
  if (logChannel) {
    const embed = new EmbedBuilder()
      .setTitle('🚨 RAID MODE ACTIVÉ')
      .setColor(0xff0000)
      .addFields(
        { name: 'Type', value: type, inline: true },
        { name: 'Par', value: triggeredBy, inline: true },
        { name: 'Channels', value: String(count), inline: true }
      )
      .setTimestamp();
    try { await logChannel.send({ embeds: [embed] }); } catch {}
  }

  return count;
}

export async function disableRaidMode(guild, client) {
  client.raidMode.set(guild.id, { active: false, timestamp: Date.now() });

  for (const [channelId, perms] of Object.entries(lockedChannels)) {
    const [gId, cId] = channelId.split(':');
    if (gId !== guild.id) continue;
    const channel = guild.channels.cache.get(cId);
    if (channel) {
      try {
        await channel.permissionOverwrites.edit(guild.roles.everyone, {
          SendMessages: perms.sendMessages ? null : false,
          Connect: perms.connect ? null : false,
        });
      } catch {}
    }
  }

  lockedChannels.delete(guild.id);
  return true;
}

export function getRaidStatus(guildId, client) {
  return client.raidMode?.get(guildId) || { active: false };
}

export async function quarantineUser(member, reason, client) {
  const guild = member.guild;
  let qRole = quarantineRoles.get(guild.id);
  if (!qRole) {
    qRole = guild.roles.cache.find(r => r.name === 'Quarantined');
    if (!qRole) qRole = await guild.roles.create({ name: 'Quarantined', color: 0xff6600 });
    quarantineRoles.set(guild.id, qRole);
  }
  await member.roles.add(qRole, reason).catch(() => {});
  try { await member.send(`⚠️ Quarantined in ${guild.name}: ${reason}`); } catch {}
}
