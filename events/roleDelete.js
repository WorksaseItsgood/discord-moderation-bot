const { AuditLogEvent } = require('discord.js');

module.exports = {
  name: 'roleDelete',
  event: 'roleDelete',

  async execute(role) {
    const client = role.client;
    const raidConfig = client.raidConfig?.get(role.guild.id);
    if (!raidConfig?.enabled) return;

    const fetchedLogs = await role.guild.fetchAuditLogs({ limit: 1, type: AuditLogEvent.RoleDelete });
    const entry = fetchedLogs.entries.first();
    if (!entry) return;

    const executor = entry.executor;
    const whitelist = raidConfig.whitelist || [];
    if (whitelist.includes(executor.id)) return;

    const { EmbedBuilder } = require('discord.js');
    const embed = new EmbedBuilder()
      .setTitle('🚨 Rôle Supprimé')
      .setColor(0xff0000)
      .setDescription(`**Rôle:** ${role.name}\n**ID:** ${role.id}\n**Supprimé par:** ${executor.tag}\n**Couleur:** ${role.hexColor}\n**Position:** ${role.position}`)
      .setTimestamp()
      .setFooter({ text: 'UltraAntiRaid v2' });

    const logChannel = role.guild.channels.cache.find(ch => ch.name === 'anti-raid-logs');
    if (logChannel) await logChannel.send({ embeds: [embed] });

    // Recreate the role
    try {
      const newRole = await role.guild.roles.create({
        name: role.name,
        color: role.hexColor,
        hoist: role.hoist,
        mentionable: role.mentionable,
        permissions: role.permissions,
        position: role.position,
        unicodeEmoji: role.unicodeEmoji,
      });

      if (logChannel) {
        await logChannel.send(`✅ Rôle **${newRole.name}** recréé avec succès (ID: ${newRole.id})`);
      }
    } catch (err) {
      if (logChannel) {
        await logChannel.send(`❌ Impossible de recréer le rôle: ${err.message}`);
      }
    }
  }
};
