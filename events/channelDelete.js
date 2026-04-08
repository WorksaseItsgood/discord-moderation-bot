const { AuditLogEvent } = require('discord.js');

module.exports = {
  name: 'channelDelete',
  event: 'channelDelete',

  async execute(channel) {
    const client = channel.client;
    const raidConfig = client.raidConfig?.get(channel.guild.id);
    if (!raidConfig?.enabled) return;

    const fetchedLogs = await channel.guild.fetchAuditLogs({ limit: 1, type: AuditLogEvent.ChannelDelete });
    const entry = fetchedLogs.entries.first();
    if (!entry) return;

    const executor = entry.executor;
    const whitelist = raidConfig.whitelist || [];
    if (whitelist.includes(executor.id)) return;

    const { EmbedBuilder } = require('discord.js');
    const embed = new EmbedBuilder()
      .setTitle('🚨 Salon Supprimé')
      .setColor(0xff0000)
      .setDescription(`**Salon:** ${channel.name}\n**Supprimé par:** ${executor.tag}\n**Action:** Recréation en cours...`)
      .setTimestamp()
      .setFooter({ text: 'UltraAntiRaid v2' });

    const logChannel = channel.guild.channels.cache.find(ch => ch.name === 'anti-raid-logs');
    if (logChannel) await logChannel.send({ embeds: [embed] });

    try {
      const newChannel = await channel.guild.channels.create(channel.name, {
        type: channel.type,
        topic: channel.topic,
        nsfw: channel.nsfw,
        bitrate: channel.bitrate,
        userLimit: channel.userLimit,
        position: channel.position,
        permissionOverwrites: channel.permissionOverwrites.cache.map(perm => ({
          id: perm.id,
          allow: perm.allow,
          deny: perm.deny,
        })),
      });
      if (logChannel) {
        await logChannel.send(`✅ Salon **${newChannel.name}** recréé avec succès.`);
      }
    } catch (err) {
      if (logChannel) {
        await logChannel.send(`❌ Impossible de recréer le salon: ${err.message}`);
      }
    }
  }
};
