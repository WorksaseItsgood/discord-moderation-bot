const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'guildMemberRemove',
  once: false,

  async execute(member) {
    const client = member.client;
    const raidConfig = client.raidConfig?.get(member.guild.id);
    if (!raidConfig?.enabled) return;

    const { EmbedBuilder } = require('discord.js');
    const logChannel = member.guild.channels.cache.find(ch => ch.name === 'anti-raid-logs');
    if (!logChannel) return;

    const embed = new EmbedBuilder()
      .setTitle('👋 Membre Parti')
      .setColor(0xffaa00)
      .setDescription(`**Membre:** ${member.user.tag}\n**ID:** ${member.user.id}`)
      .setTimestamp()
      .setFooter({ text: 'UltraAntiRaid v2' });

    await logChannel.send({ embeds: [embed] });
  }
};
