const { EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');

/**
 * UltraShield v2 - Advanced Anti-Raid & Anti-Nuke System
 * Features:
 * - Anti Bot Add (blocks bot invites during raid)
 * - Anti Channel Delete (auto-backup + restore)
 * - Anti Role Delete
 * - Anti Webhook Create/Delete
 * - Anti Guild Update
 * - Anti Ban/Kick spam
 * - Auto-lockdown with beautiful UI
 * - Configurable via buttons
 */
module.exports = function initializeUltraShield(client) {
  console.log('[UltraShield] 🛡️ Advanced Anti-Raid System initialized');

  // Storage
  client.shieldConfig = new Map();
  client.shieldLocked = new Map();
  client.channelBackups = new Map();
  client.roleBackups = new Map();
  client.raidHistory = new Map();

  // Load configs from db
  loadConfigs(client);

  // ========== EVENT LISTENERS ==========

  // Anti Bot Add
  client.on('guildMemberAdd', async (member) => {
    if (member.user.bot) {
      await handleBotAdd(member, client);
    }
    await handleMemberJoin(member, client);
  });

  // Anti Channel Delete
  client.on('channelDelete', async (channel) => {
    await handleChannelDelete(channel, client);
  });

  // Anti Role Delete
  client.on('roleDelete', async (role) => {
    await handleRoleDelete(role, client);
  });

  // Anti Webhook Events
  client.on('webhookUpdate', async (channel) => {
    await handleWebhookUpdate(channel, client);
  });

  // Anti Guild Update
  client.on('guildUpdate', async (oldGuild, newGuild) => {
    await handleGuildUpdate(oldGuild, newGuild, client);
  });

  // Anti Ban Wave
  client.on('guildBanAdd', async (ban) => {
    await handleBanAdd(ban, client);
  });

  // Anti Kick Wave
  client.on('guildMemberRemove', async (member) => {
    await handleMemberRemove(member, client);
  });

  // Message spam detection
  client.on('messageCreate', async (message) => {
    if (!message.guild || message.author.bot) return;
    await handleMessageSpam(message, client);
  });

  // Clean old data every 5 minutes
  setInterval(() => cleanOldData(client), 300000);
};

// ========== HANDLERS ==========

/**
 * Handle bot addition
 */
async function handleBotAdd(member, client) {
  const config = getConfig(member.guild.id);
  if (!config?.antiBotAdd) return;

  try {
    // Kick the bot immediately
    await member.kick('Anti-Bot Add: Unauthorized bot invitation');

    // Check if user is whitelisted
    if (isWhitelisted(member, config)) return;

    const logChannel = getLogChannel(member.guild);
    if (logChannel) {
      const embed = new EmbedBuilder()
        .setTitle('🤖 Bot Blocked')
        .setColor(0xff0000)
        .setDescription(`Unauthorized bot **${member.user.tag}** was removed.`)
        .addFields(
          { name: 'Bot', value: member.user.tag, inline: true },
          { name: 'Inviter', value: member.guild.members.cache.get(member.id)?.toString() || 'Unknown', inline: true }
        )
        .setTimestamp();

      await logChannel.send({ embeds: [embed] });
    }

    console.log(`[UltraShield] Blocked bot: ${member.user.tag}`);
  } catch (error) {
    console.log(`[UltraShield] Error blocking bot: ${error.message}`);
  }
}

/**
 * Handle member join with risk scoring
 */
async function handleMemberJoin(member, client) {
  const config = getConfig(member.guild.id);
  if (!config?.enabled) return;

  if (isWhitelisted(member, config)) return;

  // Manual raid mode - quarantine all
  if (client.shieldLocked.get(member.guild.id)) {
    await quarantineUser(member, 'Raid mode active', client);
    return;
  }

  const riskScore = calculateRiskScore(member);

  if (riskScore >= 90) {
    await member.ban({ reason: `UltraShield: Critical risk score (${riskScore})` });
    logAction(member.guild, '🔨 Ban', `Critical risk ${riskScore}`, member.user.tag);
  } else if (riskScore >= 75) {
    await member.kick({ reason: `UltraShield: High risk score (${riskScore})` });
    logAction(member.guild, '⚡ Kick', `High risk ${riskScore}`, member.user.tag);
  } else if (riskScore >= 50) {
    await quarantineUser(member, `Risk score: ${riskScore}`, client);
    logAction(member.guild, '🔒 Quarantine', `Medium risk ${riskScore}`, member.user.tag);
  }

  console.log(`[UltraShield] ${member.user.tag} joined. Risk: ${riskScore}/100`);
}

/**
 * Handle channel deletion - auto restore + punishment
 */
async function handleChannelDelete(channel, client) {
  const config = getConfig(channel.guild.id);
  if (!config?.antiChannelDelete) return;

  // Backup channel data before it's gone
  const backup = {
    name: channel.name,
    type: channel.type,
    topic: channel.topic,
    position: channel.position,
    nsfw: channel.nsfw,
    rateLimitPerUser: channel.rateLimitPerUser,
    parentId: channel.parentId,
    permissions: [],
    timestamp: Date.now()
  };

  // Save permissions
  channel.permissionOverwrites.cache.forEach((overwrite, roleId) => {
    backup.permissions.push({
      id: overwrite.id,
      allow: overwrite.allow.toArray(),
      deny: overwrite.deny.toArray()
    });
  });

  if (!client.channelBackups.has(channel.guild.id)) {
    client.channelBackups.set(channel.guild.id, []);
  }
  client.channelBackups.get(channel.guild.id).push(backup);

  // Get executor from audit log
  const executor = await getAuditExecutor(channel.guild, 'CHANNEL_DELETE');

  if (executor && !isWhitelistedUser(executor.id, config)) {
    // Punish executor
    try {
      await executor.ban({ reason: 'UltraShield: Deleted channel' });
    } catch {}

    // Restore channel
    setTimeout(async () => {
      try {
        const newChannel = await channel.guild.channels.create({
          name: backup.name,
          type: backup.type,
          topic: backup.topic,
          nsfw: backup.nsfw,
          rateLimitPerUser: backup.rateLimitPerUser,
          parent: backup.parentId,
          position: backup.position,
          permissionOverwrites: backup.permissions.map(p => ({
            id: p.id,
            allow: p.allow,
            deny: p.deny
          }))
        });
        console.log(`[UltraShield] Channel ${backup.name} restored`);
      } catch (error) {
        console.log(`[UltraShield] Failed to restore channel: ${error.message}`);
      }
    }, 2000);

    logAction(channel.guild, '🗑️ Channel Deleted', `Restored + executor banned`, backup.name);
  }
}

/**
 * Handle role deletion
 */
async function handleRoleDelete(role, client) {
  const config = getConfig(role.guild.id);
  if (!config?.antiRoleDelete) return;

  // Backup role data
  const backup = {
    name: role.name,
    color: role.color,
    hoist: role.hoist,
    position: role.position,
    permissions: role.permissions.toArray(),
    timestamp: Date.now()
  };

  if (!client.roleBackups.has(role.guild.id)) {
    client.roleBackups.set(role.guild.id, []);
  }
  client.roleBackups.get(role.guild.id).push(backup);

  const executor = await getAuditExecutor(role.guild, 'ROLE_DELETE');

  if (executor && !isWhitelistedUser(executor.id, config)) {
    try {
      await executor.ban({ reason: 'UltraShield: Deleted role' });
    } catch {}

    // Restore role
    setTimeout(async () => {
      try {
        const newRole = await role.guild.roles.create({
          name: backup.name,
          color: backup.color,
          hoist: backup.hoist,
          position: backup.position,
          permissions: backup.permissions
        });
        console.log(`[UltraShield] Role ${backup.name} restored`);
      } catch (error) {
        console.log(`[UltraShield] Failed to restore role: ${error.message}`);
      }
    }, 2000);

    logAction(role.guild, '🎭 Role Deleted', `Restored + executor banned`, backup.name);
  }
}

/**
 * Handle webhook changes
 */
async function handleWebhookUpdate(channel, client) {
  const config = getConfig(channel.guild.id);
  if (!config?.antiWebhook) return;

  const executor = await getAuditExecutor(channel.guild, 'WEBHOOK_CREATE');

  if (executor && !isWhitelistedUser(executor.id, config)) {
    try {
      await executor.ban({ reason: 'UltraShield: Created webhook' });
    } catch {}
    logAction(channel.guild, '🪝 Webhook Blocked', 'Executor banned', executor.tag);
  }
}

/**
 * Handle guild settings update
 */
async function handleGuildUpdate(oldGuild, newGuild, client) {
  const config = getConfig(newGuild.id);
  if (!config?.antiGuildUpdate) return;

  const executor = await getAuditExecutor(newGuild, 'GUILD_UPDATE');

  if (executor && !isWhitelistedUser(executor.id, config)) {
    // Revert changes
    if (oldGuild.name !== newGuild.name) {
      await newGuild.setName(oldGuild.name);
    }
    if (oldGuild.icon !== newGuild.icon) {
      await newGuild.setIcon(oldGuild.icon);
    }

    try {
      await executor.ban({ reason: 'UltraShield: Modified guild settings' });
    } catch {}
    logAction(newGuild, '⚙️ Guild Update Blocked', 'Reverted + banned', executor.tag);
  }
}

/**
 * Handle ban wave
 */
async function handleBanAdd(ban, client) {
  const config = getConfig(ban.guild.id);
  if (!config?.antiBanWave) return;

  if (!client.banTracker) client.banTracker = new Map();

  const tracker = client.banTracker.get(ban.guild.id) || [];
  tracker.push({ userId: ban.user.id, timestamp: Date.now() });

  // Keep only last 30 seconds
  const now = Date.now();
  const recent = tracker.filter(t => now - t.timestamp < 30000);
  client.banTracker.set(ban.guild.id, recent);

  if (recent.length >= (config.banThreshold || 5)) {
    const executor = await getAuditExecutor(ban.guild, 'BAN');

    if (executor && !isWhitelistedUser(executor.id, config)) {
      // Mass unbanning
      for (const banData of recent) {
        try {
          await ban.guild.members.unban(banData.userId, 'UltraShield: Mass ban rollback');
        } catch {}
      }

      try {
        await executor.ban({ reason: 'UltraShield: Mass ban attack' });
      } catch {}

      logAction(ban.guild, '🚫 Ban Wave Blocked', `Unbanned ${recent.length} users`, executor.tag);
    }

    // Trigger lockdown
    await triggerLockdown(ban.guild, 'ban_wave', client);
  }
}

/**
 * Handle member remove (kick detection)
 */
async function handleMemberRemove(member, client) {
  const config = getConfig(member.guild.id);
  if (!config?.antiKickWave) return;

  if (!client.kickTracker) client.kickTracker = new Map();

  const executor = await getAuditExecutor(member.guild, 'MEMBER_KICK');

  if (executor && !isWhitelistedUser(executor.id, config)) {
    const tracker = client.kickTracker.get(member.guild.id) || [];
    tracker.push({ userId: member.id, executorId: executor.id, timestamp: Date.now() });

    const now = Date.now();
    const recent = tracker.filter(t => now - t.timestamp < 30000);
    client.kickTracker.set(member.guild.id, recent);

    if (recent.length >= (config.kickThreshold || 5)) {
      try {
        await executor.ban({ reason: 'UltraShield: Mass kick attack' });
      } catch {}

      logAction(member.guild, '👢 Kick Wave Blocked', `Blocked ${recent.length} kicks`, executor.tag);
      await triggerLockdown(member.guild, 'kick_wave', client);
    }
  }
}

/**
 * Handle message spam
 */
async function handleMessageSpam(message, client) {
  const config = getConfig(message.guild.id);
  if (!config?.antiSpam) return;

  if (!client.msgTracker) client.msgTracker = new Map();

  const key = message.author.id;
  const tracker = client.msgTracker.get(key) || [];
  tracker.push({ timestamp: Date.now(), content: message.content });

  const now = Date.now();
  const recent = tracker.filter(t => now - t.timestamp < 5000);
  client.msgTracker.set(key, recent);

  if (recent.length >= (config.msgThreshold || 7)) {
    // Spam detected
    await message.author.timeout(300000, 'UltraShield: Message spam');

    // Filter similar messages
    const similarCount = recent.filter(m => m.content === message.content).length;
    if (similarCount >= 3) {
      const messages = await message.channel.messages.fetch({ limit: 20 });
      const toDelete = messages.filter(m =>
        m.author.id === message.author.id && m.content === message.content
      );
      await message.channel.bulkDelete(toDelete);
    }

    logAction(message.guild, '📝 Spam Detected', 'Timeout 5min', message.author.tag);
  }
}

// ========== LOCKDOWN SYSTEM ==========

/**
 * Trigger server lockdown
 */
async function triggerLockdown(guild, type, client) {
  if (client.shieldLocked.get(guild.id)) return; // Already locked

  console.log(`[UltraShield] 🚨 LOCKDOWN triggered: ${type}`);

  client.shieldLocked.set(guild.id, {
    active: true,
    type,
    timestamp: Date.now(),
    triggeredBy: 'auto'
  });

  // Store original channel perms
  const originalPerms = new Map();
  const channels = guild.channels.cache.filter(ch =>
    ch.type === 0 || ch.type === 2 || ch.type === 15
  );

  for (const [id, channel] of channels) {
    try {
      const everyone = channel.permissionOverwrites.cache.get(guild.roles.everyone.id);
      originalPerms.set(id, {
        sendMessages: everyone?.allow.has('SendMessages') ?? true,
        connect: everyone?.allow.has('Connect') ?? true,
        addReactions: everyone?.allow.has('AddReactions') ?? true
      });

      await channel.permissionOverwrites.edit(guild.roles.everyone, {
        SendMessages: false,
        AddReactions: false,
        Connect: false,
        Speak: false,
        CreatePublicThreads: false,
        CreatePrivateThreads: false
      }, `UltraShield Lockdown: ${type}`);
    } catch {}
  }

  client.shieldLockedPerms.set(guild.id, originalPerms);

  // Send lockdown embed with buttons
  const logChannel = getLogChannel(guild);
  if (logChannel) {
    const embed = new EmbedBuilder()
      .setTitle('🔒 SERVER LOCKED DOWN')
      .setColor(0xff0000)
      .setDescription('UltraShield has detected a raid attack. All channels have been locked.')
      .addFields(
        { name: 'Type', value: type, inline: true },
        { name: 'Action', value: 'All channels locked', inline: true },
        { name: 'Status', value: '🔒 Locked', inline: true }
      )
      .setTimestamp()
      .setFooter({ text: 'UltraShield v2 • Powered by Advanced Anti-Raid Protection' });

    const unlockButton = new ButtonBuilder()
      .setCustomId('shield_unlock')
      .setLabel('🔓 Unlock Server')
      .setStyle(ButtonStyle.Danger);

    const row = new ActionRowBuilder().addComponents(unlockButton);

    await logChannel.send({ embeds: [embed], components: [row] });

    // Also ping moderators
    const modRole = guild.roles.cache.find(r =>
      r.name.toLowerCase().includes('mod') ||
      r.name.toLowerCase().includes('admin') ||
      r.permissions.has('ManageGuild')
    );
    if (modRole) {
      await logChannel.send(`${modRole} **RAID DETECTED!**`);
    }
  }
}

/**
 * Unlock server
 */
async function unlockServer(guild, triggeredBy, client) {
  client.shieldLocked.delete(guild.id);

  // Restore original perms
  const originalPerms = client.shieldLockedPerms.get(guild.id);
  if (originalPerms) {
    for (const [channelId, perms] of originalPerms) {
      try {
        const channel = guild.channels.cache.get(channelId);
        if (channel) {
          await channel.permissionOverwrites.delete(guild.roles.everyone, 'UltraShield: Unlocked');
        }
      } catch {}
    }
    client.shieldLockedPerms.delete(guild.id);
  }

  // Log
  const logChannel = getLogChannel(guild);
  if (logChannel) {
    const embed = new EmbedBuilder()
      .setTitle('🔓 Server Unlocked')
      .setColor(0x00ff00)
      .setDescription(`Unlocked by ${triggeredBy.tag}`)
      .setTimestamp();

    await logChannel.send({ embeds: [embed] });
  }

  console.log(`[UltraShield] Server unlocked by ${triggeredBy.tag}`);
}

// ========== HELPERS ==========

function calculateRiskScore(member) {
  let score = 0;

  // Account age (0-40)
  const ageDays = (Date.now() - member.user.createdTimestamp) / 86400000;
  if (ageDays < 1) score += 40;
  else if (ageDays < 3) score += 30;
  else if (ageDays < 7) score += 15;

  // No avatar (0-20)
  if (!member.user.avatar) score += 20;

  // Username analysis (0-40)
  const username = member.user.username;
  if (/(.)\1{4,}/.test(username)) score += 15;
  if (/[0-9]{6,}/.test(username)) score += 15;
  if (/^[a-z]{1,3}[0-9]{4,}$/i.test(username)) score += 10;
  if (/(free|nitro|gift|winner|prize|discord)/i.test(username)) score += 10;

  // Bot pattern in username
  if (/user\d{5,}/i.test(username) || /temp\d{5,}/i.test(username)) {
    score += 20;
  }

  return Math.min(score, 100);
}

function getConfig(guildId) {
  return client.shieldConfig.get(guildId) || {
    enabled: true,
    antiBotAdd: true,
    antiChannelDelete: true,
    antiRoleDelete: true,
    antiWebhook: true,
    antiGuildUpdate: true,
    antiBanWave: true,
    antiKickWave: true,
    antiSpam: true,
    banThreshold: 5,
    kickThreshold: 5,
    msgThreshold: 7
  };
}

function loadConfigs(client) {
  // Load from DB if available
}

function getLogChannel(guild) {
  return guild.channels.cache.find(ch =>
    ch.name === 'shield-logs' ||
    ch.name === 'mod-logs' ||
    ch.name === 'anti-raid'
  );
}

async function getAuditExecutor(guild, type) {
  const types = {
    CHANNEL_DELETE: 12,
    ROLE_DELETE: 32,
    MEMBER_KICK: 20,
    BAN: 20,
    WEBHOOK_CREATE: 50,
    GUILD_UPDATE: 1
  };

  try {
    const audit = await guild.fetchAuditLogs({
      limit: 1,
      type: types[type] || 0
    });
    return audit.entries.first()?.executor;
  } catch {
    return null;
  }
}

function isWhitelisted(member, config) {
  if (!config.whitelist) return false;
  if (config.whitelist.includes(member.id)) return true;
  if (config.whitelistRoles?.some(r => member.roles.cache.has(r))) return true;
  return false;
}

function isWhitelistedUser(userId, config) {
  return config.whitelist?.includes(userId);
}

async function quarantineUser(member, reason, client) {
  const config = getConfig(member.guild.id);
  const quarantineRoleId = config.quarantineRole;

  try {
    if (quarantineRoleId) {
      const role = member.guild.roles.cache.get(quarantineRoleId);
      if (role) await member.roles.add(role, reason);
    }
    console.log(`[UltraShield] Quarantined: ${member.user.tag} - ${reason}`);
  } catch (error) {
    console.log(`[UltraShield] Quarantine error: ${error.message}`);
  }
}

async function logAction(guild, action, details, target) {
  const logChannel = getLogChannel(guild);
  if (!logChannel) return;

  const embed = new EmbedBuilder()
    .setTitle(`🛡️ ${action}`)
    .setColor(0xffaa00)
    .addFields(
      { name: 'Details', value: details, inline: true },
      { name: 'Target', value: target, inline: true }
    )
    .setTimestamp();

  await logChannel.send({ embeds: [embed] });
}

function cleanOldData(client) {
  const now = Date.now();

  // Clean msg tracker
  if (client.msgTracker) {
    for (const [userId, msgs] of client.msgTracker) {
      client.msgTracker.set(userId, msgs.filter(m => now - m.timestamp < 10000));
    }
  }

  // Clean ban tracker
  if (client.banTracker) {
    for (const [guildId, bans] of client.banTracker) {
      client.banTracker.set(guildId, bans.filter(b => now - b.timestamp < 30000));
    }
  }

  console.log('[UltraShield] Cleaned old data');
}

// Export for button handler
module.exports.unlockServer = unlockServer;
module.exports.getConfig = getConfig;
module.exports.triggerLockdown = triggerLockdown;