const { AuditLogEvent } = require('discord.js');

module.exports = {
  name: 'kickAdd',
  event: 'kickAdd',

  async execute(member) {
    const client = member.client;
    const raidConfig = client.raidConfig?.get(member.guild.id);
    if (!raidConfig?.enabled) return;

    if (!client.kickTracker) client.kickTracker = new Map();

    const tracker = client.kickTracker.get(member.guild.id) || { count: 0, users: [], startTime: Date.now() };
    tracker.count++;
    tracker.users.push(member.user.id);
    tracker.startTime = Date.now();
    client.kickTracker.set(member.guild.id, tracker);

    // Detect kick wave (5+ kicks in 30 seconds)
    if (tracker.count >= 5 && Date.now() - tracker.startTime < 30000) {
      const fetchedLogs = await member.guild.fetchAuditLogs({ limit: 10, type: AuditLogEvent.MemberKick });
      const executor = fetchedLogs.entries.first()?.executor;

      const whitelist = raidConfig.whitelist || [];
      if (executor && !whitelist.includes(executor.id)) {
        const logChannel = member.guild.channels.cache.find(ch => ch.name === 'anti-raid-logs');
        if (logChannel) {
          const { EmbedBuilder } = require('discord.js');
          const embed = new EmbedBuilder()
            .setTitle('🚨 KICK WAVE DÉTECTÉE!')
            .setColor(0xff0000)
            .setDescription(`**Modérateur:** ${executor.tag}\n**Kicks détectés:** ${tracker.count}\n**Action:** Lockdown automatique`)
            .setTimestamp()
            .setFooter({ text: 'UltraAntiRaid v2' });
          await logChannel.send({ embeds: [embed] });
        }

        // Auto-lockdown
        if (client.modules?.ultraShield) {
          await client.modules.ultraShield.triggerLockdown(member.guild, 'kick_wave', client);
        }
      }

      // Reset tracker
      client.kickTracker.set(member.guild.id, { count: 0, users: [], startTime: Date.now() });
    }
  }
};
