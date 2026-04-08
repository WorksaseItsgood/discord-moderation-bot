const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'guildUpdate',
  event: 'guildUpdate',

  async execute(oldGuild, newGuild) {
    const client = newGuild.client;
    const raidConfig = client.raidConfig?.get(newGuild.id);
    if (!raidConfig?.enabled) return;

    const changes = [];
    if (oldGuild.name !== newGuild.name) changes.push(`Nom: ${oldGuild.name} → ${newGuild.name}`);
    if (oldGuild.iconURL() !== newGuild.iconURL()) changes.push('Icône modifiée');
    if (oldGuild.splashURL() !== newGuild.splashURL()) changes.push('Splash modifié');
    if (oldGuild.description !== newGuild.description) changes.push('Description modifiée');

    if (changes.length === 0) return;

    const logChannel = newGuild.channels.cache.find(ch => ch.name === 'anti-raid-logs' || ch.name === 'raid-logs');
    if (!logChannel) return;

    const embed = new EmbedBuilder()
      .setTitle('🛡️ Modification Serveur Détectée')
      .setColor(0xffaa00)
      .setDescription(changes.join('\n'))
      .setTimestamp()
      .setFooter({ text: 'UltraAntiRaid v2' });

    await logChannel.send({ embeds: [embed] });
  }
};
