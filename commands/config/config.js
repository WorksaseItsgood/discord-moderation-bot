const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

// Config command - view current configuration
module.exports = {
  data: new SlashCommandBuilder()
    .setName('config')
    .setDescription('View bot configuration')
    .addStringOption(option =>
      option.setName('section')
        .setDescription('Config section to view')
        .setRequired(false)
        .addChoices(
          { name: 'Anti-Raid', value: 'raid' },
          { name: 'Auto-Moderation', value: 'automod' },
          { name: 'Logging', value: 'logging' },
          { name: 'Moderation', value: 'moderation' }
        )),
  permissions: [PermissionFlagsBits.Administrator],
  async execute(interaction, client) {
    const section = interaction.options.getString('section') || 'all';
    const config = require('../config').defaultConfig;
    
    const embed = new EmbedBuilder()
      .setTitle('⚙️ Bot Configuration')
      .setColor(0x00ff00)
      .setTimestamp();
    
    if (section === 'all' || section === 'raid') {
      const raid = config.raid || {};
      embed.addFields({
        name: '🛡️ Anti-Raid',
        value: [
          `Enabled: ${raid.enabled ? '✅' : '❌'}`,
          `Max Joins/Sec: ${raid.maxJoinsPerSecond}`,
          `Min Account Age: ${raid.minAccountAge} days`,
          `Require Avatar: ${raid.requireAvatar ? '✅' : '❌'}`,
          `Log Channel: ${raid.logChannel ? `<#${raid.logChannel}>` : 'Not set'}`
        ].join('\n'),
        inline: true
      });
    }
    
    if (section === 'all' || section === 'automod') {
      const autoMod = config.autoMod || {};
      embed.addFields({
        name: '🤖 Auto-Moderation',
        value: [
          `Enabled: ${autoMod.enabled ? '✅' : '❌'}`,
          `Anti-Spam: ${autoMod.spam?.enabled ? '✅' : '❌'}`,
          `Anti-Invite: ${autoMod.antiInvite?.enabled ? '✅' : '❌'}`,
          `Anti-Scam: ${autoMod.antiScam?.enabled ? '✅' : '❌'}`,
          `Anti-Swear: ${autoMod.antiSwear?.enabled ? '✅' : '❌'}`
        ].join('\n'),
        inline: true
      });
    }
    
    if (section === 'all' || section === 'logging') {
      const logging = config.logging || {};
      embed.addFields({
        name: '📝 Logging',
        value: [
          `Enabled: ${logging.enabled ? '✅' : '❌'}`,
          `Mod Logs: ${logging.moderation ? `<#${logging.moderation}>` : 'Not set'}`,
          `Message Logs: ${logging.messages ? `<#${logging.messages}>` : 'Not set'}`,
          `Member Logs: ${logging.members ? `<#${logging.members}>` : 'Not set'}`,
          `Voice Logs: ${logging.voice ? `<#${logging.voice}>` : 'Not set'}`
        ].join('\n'),
        inline: true
      });
    }
    
    if (section === 'all' || section === 'moderation') {
      const moderation = config.moderation || {};
      embed.addFields({
        name: '🔨 Moderation',
        value: [
          `Mute Role: ${moderation.muteRole ? `<@&${moderation.muteRole}>` : 'Not set'}`,
          `DM on Action: ${moderation.dmOnAction ? '✅' : '❌'}`,
          `Default Warn Expiry: ${moderation.warnExpiryDays} days`
        ].join('\n'),
        inline: true
      });
    }
    
    await interaction.reply({ embeds: [embed], ephemeral: true });
  }
};