const { AuditLogEvent } = require('discord.js');

module.exports = {
  name: 'webhookDelete',
  event: 'webhookDelete',

  async execute(webhook) {
    const client = webhook.client;
    const raidConfig = client.raidConfig?.get(webhook.guildId);
    if (!raidConfig?.enabled) return;

    const fetchedLogs = await webhook.guild.fetchAuditLogs({ limit: 1, type: AuditLogEvent.WebhookDelete });
    const entry = fetchedLogs.entries.first();
    if (!entry) return;

    const executor = entry.executor;
    const whitelist = raidConfig.whitelist || [];
    if (whitelist.includes(executor.id)) return;

    const { EmbedBuilder } = require('discord.js');
    const embed = new EmbedBuilder()
      .setTitle('🚨 Webhook Supprimé')
      .setColor(0xff0000)
      .setDescription(`**Webhook:** ${webhook.name}\n**ID:** ${webhook.id}\n**Supprimé par:** ${executor.tag}`)
      .setTimestamp()
      .setFooter({ text: 'UltraAntiRaid v2' });

    const logChannel = webhook.guild.channels.cache.find(ch => ch.name === 'anti-raid-logs');
    if (logChannel) await logChannel.send({ embeds: [embed] });
  }
};
