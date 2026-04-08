const { AuditLogEvent } = require('discord.js');

module.exports = {
  name: 'banAdd',
  event: 'banAdd',

  async execute(ban) {
    const client = ban.client;
    const raidConfig = client.raidConfig?.get(ban.guild.id);
    if (!raidConfig?.enabled) return;

    if (!client.banTracker) client.banTracker = new Map();

    const tracker = client.banTracker.get(ban.guild.id) || { count: 0, users: [], startTime: Date.now() };
    tracker.count++;
    tracker.users.push(ban.user.id);
    tracker.startTime = Date.now();
    client.banTracker.set(ban.guild.id, tracker);

    // Detect ban wave (5+ bans in 30 seconds)
    if (tracker.count >= 5 && Date.now() - tracker.startTime < 30000) {
      const fetchedLogs = await ban.guild.fetchAuditLogs({ limit: 10, type: AuditLogEvent.GuildBanAdd });
      const executor = fetchedLogs.entries.first()?.executor;

      const whitelist = raidConfig.whitelist || [];
      if (executor && !whitelist.includes(executor.id)) {
        const logChannel = ban.guild.channels.cache.find(ch => ch.name === 'anti-raid-logs');
        if (logChannel) {
          const { EmbedBuilder } = require('discord.js');
          const embed = new EmbedBuilder()
            .setTitle('🚨 BAN WAVE DÉTECTÉE!')
            .setColor(0xff0000)
            .setDescription(`**Modérateur:** ${executor.tag}\n**Bans détectés:** ${tracker.count}\n**Action:** Lockdown automatique`)
            .setTimestamp()
            .setFooter({ text: 'UltraAntiRaid v2' });
          await logChannel.send({ embeds: [embed] });
        }

        // Auto-lockdown
        if (client.modules?.ultraShield) {
          await client.modules.ultraShield.triggerLockdown(ban.guild, 'ban_wave', client);
        }
      }

      // Reset tracker
      client.banTracker.set(ban.guild.id, { count: 0, users: [], startTime: Date.now() });
    }
  }
};
