/**
 * Guild Member Add Event
 * Handles auto-role, raid protection, anti-bot, and welcome messages
 */

import { EmbedBuilder } from 'discord.js';
import { getGuildConfig, getWhitelist, getRaidConfig, updateGuildConfig } from '../database/db.js';
import { checkJoinSpeed, autoKickFastJoins, quarantineUser } from '../handlers/raidHandler.js';
import { logServer, logAntibot } from '../utils/logManager.js';

export default {
  name: 'guildMemberAdd',
  once: false,

  async execute(member, client) {
    const { guild, user } = member;
    const guildId = guild.id;

    try {
      // ==================== ANTI-BOT CHECK ====================
      if (user.bot) {
        try {
          await handleBotJoin(member, client);
        } catch (error) {
          client.logger.error('[guildMemberAdd] Anti-bot error:', error);
        }
        return; // Don't continue processing for bots
      }

      // ==================== MEMBER JOIN PROCESSING ====================
      
      // Check whitelist
      try {
        const whitelist = await getWhitelist(guildId);
        if (whitelist.users?.includes(member.id)) return;
        if (member.roles?.cache.some(r => whitelist.roles?.includes(r.id))) return;
      } catch {}

      // Check join speed and raid protection
      try {
        const raidCheck = await checkJoinSpeed(guild, member, client);
        
        if (raidCheck.shouldQuarantine) {
          await quarantineUser(member, 'Raid mode active - Auto quarantine', client);
        }
        
        // Auto-kick fast joins during raid mode
        if (raidCheck.autoEnabled) {
          // Already logged in checkJoinSpeed
        }
      } catch (error) {
        client.logger.error('[guildMemberAdd] Raid check error:', error);
      }

      // Auto-role
      const config = client.guildConfigs.get(guildId) || {};
      if (config.autoRole) {
        try {
          await member.roles.add(config.autoRole).catch(() => {});
        } catch {}
      }

      // Welcome message
      if (config.welcomeChannel && config.welcomeMessage) {
        const channel = guild.channels.cache.get(config.welcomeChannel);
        if (channel) {
          const msg = config.welcomeMessage
            .replace('{user}', member.toString())
            .replace('{server}', guild.name);
          try { await channel.send(msg); } catch {}
        }
      }

      // Log the join
      try {
        await logServer(guild, 'join', {
          user: member.user,
          description: `Nouveau membre: ${member.user.tag}`,
          extra: `Compte créé il y a ${Math.floor((Date.now() - member.user.createdTimestamp) / 86400000)} jour(s)`,
        });
      } catch (error) {
        client.logger.error('[guildMemberAdd] Log error:', error);
      }

    } catch (error) {
      client.logger.error('[guildMemberAdd] General error:', error);
    }
  },
};

/**
 * Handle bot joins - anti-bot protection
 */
async function handleBotJoin(member, client) {
  const guild = member.guild;
  const guildId = guild.id;
  
  // Get anti-bot config from both raid_config and guild_config
  const raidConfig = getRaidConfig(guildId);
  const guildConfig = client.guildConfigs.get(guildId) || getGuildConfig(guildId);
  
  // Check if antibot is enabled (check both sources)
  const antibotEnabled = raidConfig.antiBotEnabled || guildConfig.antibot_enabled;
  
  if (!antibotEnabled) {
    // Antibot is disabled, allow the bot
    return;
  }
  
  // Get whitelist (check both raid_config and guild_config)
  const antibotWhitelist = raidConfig.antiBotWhitelist || guildConfig.antibot_whitelist || [];
  
  // Check if bot is whitelisted
  if (antibotWhitelist.includes(member.id)) {
    await logAntibot(guild, 'botAllowed', {
      bot: member.user,
      reason: 'Bot is whitelisted',
    });
    return;
  }
  
  // Try to find who added this bot by checking audit log
  let inviter = null;
  try {
    const auditLogs = await guild.fetchAuditLogs({ type: 'BOT_ADD', limit: 5 });
    const botAddEntry = auditLogs.entries.find(entry => {
      const target = entry.target;
      return target && target.id === member.id;
    });
    
    if (botAddEntry && botAddEntry.executor) {
      inviter = await guild.members.fetch(botAddEntry.executor.id).catch(() => null);
    }
  } catch (error) {
    // Couldn't fetch audit log, continue anyway
  }
  
  // Check if inviter is whitelisted
  if (inviter && antibotWhitelist.includes(inviter.id)) {
    await logAntibot(guild, 'botAllowed', {
      bot: member.user,
      inviter: inviter.user,
      reason: 'Inviter is whitelisted',
    });
    return;
  }
  
  // Not whitelisted - kick the bot and derank the inviter if found
  try {
    await member.kick('Anti-Bot protection: Unauthorized bot added');
    
    await logAntibot(guild, 'botKick', {
      bot: member.user,
      inviter: inviter?.user,
      reason: 'Unauthorized bot detected and kicked',
    });
    
    // If we found who added the bot, derank them
    if (inviter && !inviter.permissions.has('Administrator')) {
      try {
        const roles = inviter.roles.cache.filter(r => r.id !== guild.roles.everyone.id);
        const roleNames = roles.map(r => r.name).join(', ') || 'Aucun';
        
        await inviter.roles.set([], 'Added unauthorized bot - Anti-Bot protection');
        
        // DM the user
        try {
          await inviter.send({
            embeds: [new EmbedBuilder()
              .setTitle('⚠️ Rôles supprimés')
              .setColor(0xff4757)
              .setDescription(`Vos rôles ont été supprimés dans **${guild.name}** car vous avez ajouté un bot non autorisé.`)
              .addFields({ name: '📝 Raison', value: 'Ajout d\'un bot non autorisé - Protection anti-bot active', inline: false })
              .setFooter({ text: `Niotic Moderation • ${new Date().toLocaleString('fr-FR')}` })
              .setTimestamp()
            ]
          });
        } catch {}
        
        await logAntibot(guild, 'botDerank', {
          bot: member.user,
          inviter: inviter.user,
          reason: 'Inviter deranked for adding unauthorized bot',
        });
      } catch (derankError) {
        client.logger.warn('[AntiBot] Failed to derank inviter:', derankError);
      }
    }
  } catch (kickError) {
    client.logger.error('[AntiBot] Failed to kick bot:', kickError);
  }
}

