/**
 * Auto-Mod Handler - Automatic moderation based on server rules
 *
 * Features:
 * - Word filter (blacklist/whitelist)
 * - Link filter
 * - Mention spam filter
 * - Image spam filter
 * - Token/credential detection
 * - Auto-delete infractions
 * - Configurable actions
 */

import { EmbedBuilder, PermissionFlagsBits } from 'discord.js';

export function setupAutoMod(client) {
  // Auto-mod config per guild
  client.autoModConfig = new Map();

  // Message listener
  client.on('messageCreate', async (message) => {
    if (message.author.bot) return;
    if (!message.guild) return;

    await checkAutoMod(message, client);
  });

  client.logger.info('[AutoMod] Initialized');
}

// ====================== AUTO-MOD CHECKS ======================

async function checkAutoMod(message, client) {
  const { guild, author, content, member, channel } = message;
  const guildId = guild.id;
  const userId = author.id;

  // Get config
  const config = client.autoModConfig.get(guildId) || getDefaultConfig();

  // Whitelist check
  if (config.whitelistEnabled) {
    const { getWhitelist } = await import('../../database/db.js');
    const whitelist = await getWhitelist(guildId);
    if (whitelist.users?.includes(userId)) return;
    if (member?.roles?.cache.some((r) => whitelist.roles?.includes(r.id))) return;
  }

  const lowerContent = content.toLowerCase();

  // === CHECK 1: Blacklisted Words ===
  if (config.wordFilterEnabled && config.blacklist?.length > 0) {
    const foundWords = config.blacklist.filter((word) =>
      lowerContent.includes(word.toLowerCase())
    );

    if (foundWords.length > 0) {
      await handleViolation(message, 'Blacklisted word(s)', config, client);
      return;
    }
  }

  // === CHECK 2: Link Filter ===
  if (config.linkFilterEnabled) {
    const linkPattern = /https?:\/\/[^\s]+|discord\.gg\/[^\s]+/gi;
    const hasLink = linkPattern.test(content);

    if (hasLink) {
      // Allow if user has permission
      if (member?.permissions.has(PermissionFlagsBits.ManageMessages)) {
        // Check whitelist channels
        if (config.whitelistChannels?.includes(channel.id)) return;
      } else {
        await handleViolation(message, 'Unauthorized link', config, client);
        return;
      }
    }
  }

  // === CHECK 3: Mention Spam ===
  if (config.mentionSpamEnabled) {
    const mentionCount = message.mentions.members.size +
                       message.mentions.roles.size +
                       message.mentions.everyone ? 1 : 0;

    if (mentionCount >= config.mentionSpamThreshold) {
      await handleViolation(message, `Mention spam (${mentionCount})`, config, client);
      return;
    }
  }

  // === CHECK 4: Token/Credential Detection ===
  if (config.tokenFilterEnabled) {
    const tokenPatterns = [
      /[a-zA-Z0-9_-]{20,}\.[a-zA-Z0-9_-]{6,}\.[a-zA-Z0-9_-]{27,}/,  // Discord tokens
      /sk-[a-zA-Z0-9]{20,}/,                                        // OpenAI keys
      /AIza[a-zA-Z0-9_-]{35}/,                                      // Google API keys
      /[a-zA-Z0-9]{32}:[a-zA-Z0-9]{32}/,                           // Generic tokens
    ];

    if (tokenPatterns.some((p) => p.test(content))) {
      await handleViolation(message, 'Potential token/credential detected', config, client);
      return;
    }
  }

  // === CHECK 5: Spam Characters ===
  if (config.spamFilterEnabled) {
    // Repeated characters
    if (/(.)\1{6,}/.test(content)) {
      await handleViolation(message, 'Spam characters', config, client);
      return;
    }

    // Repeated words
    if (/(.+)\s+\1{3,}/i.test(content)) {
      await handleViolation(message, 'Repeated words spam', config, client);
      return;
    }
  }
}

// ====================== VIOLATION HANDLER ======================

async function handleViolation(message, reason, config, client) {
  const { guild, author, channel } = message;
  const guildId = guild.id;

  try {
    // Delete message
    await message.delete().catch(() => {});

    // Determine action
    const action = config.violationAction || 'timeout';

    switch (action) {
      case 'delete':
        // Just delete
        break;
      case 'warn':
        const { addWarning } = await import('../../database/db.js');
        await addWarning(guildId, author.id, {
          reason: `AutoMod: ${reason}`,
          moderator: client.user.id,
          timestamp: Date.now(),
        });
        break;
      case 'timeout':
        await message.member?.timeout(300000, `AutoMod: ${reason}`).catch(() => {});
        break;
      case 'kick':
        await message.member?.kick(`AutoMod: ${reason}`).catch(() => {});
        break;
    }

    // Log
    if (config.logEnabled) {
      let logChannel = guild.channels.cache.get(config.logChannelId);
      if (!logChannel) {
        logChannel = guild.channels.cache.find(
          (ch) => ch.name === 'automod-logs' || ch.name === 'mod-logs'
        );
      }

      if (logChannel) {
        const embed = new EmbedBuilder()
          .setTitle('⚙️ AutoMod Action')
          .setColor(0xff6600)
          .addFields(
            { name: 'User', value: author.tag, inline: true },
            { name: 'Channel', value: channel.name, inline: true },
            { name: 'Reason', value: reason, inline: true },
            { name: 'Action', value: action, inline: true }
          )
          .setTimestamp();

        await logChannel.send({ embeds: [embed] });
      }
    }

    // Notify user
    if (config.notifyEnabled) {
      try {
        await channel.send({
          content: `⚠️ <@${author.id}>, your message was removed for: **${reason}**`,
        }).then((m) => setTimeout(() => m.delete().catch(() => {}), 3000));
      } catch {}
    }
  } catch (err) {
    client.logger.error(`AutoMod error: ${err.message}`);
  }
}

// ====================== DEFAULT CONFIG ======================

function getDefaultConfig() {
  return {
    wordFilterEnabled: true,
    linkFilterEnabled: true,
    mentionSpamEnabled: true,
    mentionSpamThreshold: 5,
    tokenFilterEnabled: true,
    spamFilterEnabled: true,
    whitelistEnabled: true,
    logEnabled: true,
    notifyEnabled: true,
    violationAction: 'timeout',
    blacklist: [
      // Add common blacklist words here
    ],
    whitelistChannels: [],
  };
}

// ====================== CONFIG MANAGEMENT ======================

export function getAutoModConfig(guildId, client) {
  return client.autoModConfig.get(guildId) || getDefaultConfig();
}

export function setAutoModConfig(guildId, config, client) {
  client.autoModConfig.set(guildId, { ...getDefaultConfig(), ...config });
}
