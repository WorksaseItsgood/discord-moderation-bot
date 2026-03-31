const { EmbedBuilder } = require('discord.js');
const { defaultConfig } = require('../config');

/**
 * Guild Member Add Event
 * Logs and handles new member joins
 */
module.exports = {
  name: 'guildMemberAdd',
  once: false,
  async execute(member, client) {
    const config = defaultConfig;
    const guild = member.guild;
    
    // Log member join
    if (config.logging?.enabled && config.logging?.members) {
      const logChannel = guild.channels.cache.get(config.logging.members);
      if (logChannel) {
        const accountAge = Math.floor((Date.now() - member.user.createdTimestamp) / (1000 * 60 * 60 * 24));
        
        const embed = new EmbedBuilder()
          .setTitle('👤 Member Joined')
          .setColor(0x00ff00)
          .setTimestamp()
          .addFields(
            { name: 'User', value: `${member} (${member.user.id})`, inline: true },
            { name: 'Account Age', value: `${accountAge} days`, inline: true },
            { name: 'Bot', value: member.user.bot ? '🤖 Yes' : '👤 No', inline: true }
          );
        
        await logChannel.send({ embeds: [embed] }).catch(() => {});
      }
    }
    
    // Anti-Raid is handled in systems/antiRaid.js
  }
};