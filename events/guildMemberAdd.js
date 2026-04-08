const { AuditLogEvent } = require('discord.js');

module.exports = {
  name: 'guildMemberAdd',
  event: 'guildMemberAdd',

  async execute(member) {
    const client = member.client;
    const raidConfig = client.raidConfig?.get(member.guild.id);
    if (!raidConfig?.enabled) return;

    // Anti-bot-add: kick bots that aren't whitelisted
    if (member.user.bot) {
      const whitelist = raidConfig.whitelist || [];
      if (whitelist.includes(member.user.id)) return;

      // Check if this bot was invited during raid mode
      const fetchedLogs = await member.guild.fetchAuditLogs({ 
        limit: 5, 
        type: AuditLogEvent.BotAdd 
      });
      const botAddLog = fetchedLogs.entries.find(e => e.target?.id === member.user.id);
      const executor = botAddLog?.executor;

      const whitelistExecutors = raidConfig.whitelist || [];
      if (executor && !whitelistExecutors.includes(executor.id)) {
        try {
          await member.kick('🔒 Anti-Raid: Bot non autorisé ajouté pendant le raid');

          const logChannel = member.guild.channels.cache.find(ch => ch.name === 'anti-raid-logs');
          if (logChannel) {
            const { EmbedBuilder } = require('discord.js');
            const embed = new EmbedBuilder()
              .setTitle('🤖 Bot Non Autorisé Kické')
              .setColor(0xff0000)
              .setDescription(`**Bot:** ${member.user.tag}\n**Ajouté par:** ${executor.tag}\n**Raison:** Anti-Raid actif`)
              .setTimestamp()
              .setFooter({ text: 'UltraAntiRaid v2' });
            await logChannel.send({ embeds: [embed] });
          }
        } catch (err) {
          console.error(`[UltraAntiRaid] Impossible de kicker le bot: ${err.message}`);
        }
      }
    }
  }
};
