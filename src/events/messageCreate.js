import { onMessageCreate as onRaidMessageCreate } from '../handlers/raidDetection.js';
import { checkRaidAction, recordRaidAction } from '../handlers/raidDetector.js';
import { getRaidConfig } from '../database/db.js';
import { autoDerankUser } from '../handlers/raidHandler.js';
import { logRaidAction } from '../utils/logManager.js';

export default {
  name: 'messageCreate',
  once: false,

  async execute(message, client) {
    if (message.author.bot) return;
    if (!message.guild) return;

    const guildId = message.guild.id;
    const userId = message.author.id;

    // Anti-spam check (legacy)
    if (client.antiSpam?.has(guildId)) {
      const { checkSpam } = await import('../handlers/antiSpamHandler.js').catch(() => ({ checkSpam: null }));
      if (checkSpam) {
        try { await checkSpam(message, client); } catch {}
      }
    }

    // Raid detection - spam check using new raidDetector
    try {
      const config = getRaidConfig(guildId);
      if (config && config.autoDerankEnabled) {
        // Check if user is whitelisted
        if (config.raidWhitelist?.includes(userId) || config.whitelistBypass?.includes(userId)) {
          return;
        }

        // Record this message
        recordRaidAction(guildId, userId, 'spam', 1);

        // Check spam threshold
        const result = checkRaidAction(
          guildId,
          userId,
          'spam',
          config.raidSpamThreshold || config.spamThreshold || 20,
          config.raidSpamWindow || config.spamWindowSeconds || 10
        );

        if (result.detected) {
          const member = await message.guild.members.fetch(userId).catch(() => null);
          if (member && !member.permissions.has('Administrator')) {
            // Derank the user
            await autoDerankUser(message.guild, member, `Spam detected: ${result.count} messages in ${config.raidSpamWindow || config.spamWindowSeconds || 10} seconds`, client);

            await logRaidAction(message.guild, userId, 'spam', {
              target: message.author,
              reason: `Spam detected: ${result.count} messages`,
              count: result.count,
              threshold: result.threshold,
            });
          }
        }
      }
    } catch (e) {
      // Fall back to legacy raid detection
      if (client.raidMode?.has(guildId) || client.raidDetectionEnabled) {
        try {
          await onRaidMessageCreate(message, client);
        } catch (err) {
          console.error('[RaidDetection] spam check error:', err);
        }
      }
    }
  },
};
