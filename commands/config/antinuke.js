const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

// Anti-Nuke setup command
module.exports = {
  data: new SlashCommandBuilder()
    .setName('antinuke')
    .setDescription('Configure anti-nuke server protection')
    .addStringOption(option =>
      option.setName('action')
        .setDescription('Action to perform')
        .setRequired(true)
        .addChoices(
          { name: 'Setup', value: 'setup' },
          { name: 'Whitelist', value: 'whitelist' },
          { name: 'Status', value: 'status' },
          { name: 'Disable', value: 'disable' }
        ))
    .addBooleanOption(option =>
      option.setName('enabled')
        .setDescription('Enable/disable')
        .setRequired(false))
    .addRoleOption(option =>
      option.setName('role')
        .setDescription('Role to whitelist')
        .setRequired(false))
    .addUserOption(option =>
      option.setName('user')
        .setDescription('User to whitelist')
        .setRequired(false))
    .addIntegerOption(option =>
      option.setName('threshold')
        .setDescription('Action threshold')
        .setRequired(false)),
  permissions: [PermissionFlagsBits.Administrator],
  async execute(interaction, client) {
    const action = interaction.options.getString('action');
    const enabled = interaction.options.getBoolean('enabled');
    const role = interaction.options.getRole('role');
    const user = interaction.options.getUser('user');
    const threshold = interaction.options.getInteger('threshold');
    const guildId = interaction.guild.id;
    const db = require('../database');
    
    switch (action) {
      case 'setup':
        db.setAntiNukeSettings(guildId, {
          enabled: 1,
          whitelistRoles: [],
          whitelistUsers: [],
          webhookLimit: 5,
          channelLimit: 5,
          roleLimit: 5,
          banThreshold: 5,
          kickThreshold: 10,
          botWhitelist: []
        });
        
        await interaction.reply('✅ Anti-Nuke enabled with default settings!');
        break;
        
      case 'whitelist': {
        const currentSettings = db.getAntiNukeSettings(guildId) || {};
        
        let whitelistRoles = currentSettings.whitelist_roles ? JSON.parse(currentSettings.whitelist_roles) : [];
        let whitelistUsers = currentSettings.whitelist_users ? JSON.parse(currentSettings.whitelist_users) : [];
        
        if (role) {
          if (!whitelistRoles.includes(role.id)) {
            whitelistRoles.push(role.id);
          }
        }
        
        if (user) {
          if (!whitelistUsers.includes(user.id)) {
            whitelistUsers.push(user.id);
          }
        }
        
        db.setAntiNukeSettings(guildId, {
          ...currentSettings,
          whitelistRoles: whitelistRoles,
          whitelistUsers: whitelistUsers
        });
        
        await interaction.reply('✅ Whitelist updated!');
        break;
      }
        
      case 'status': {
        const settings = db.getAntiNukeSettings(guildId);
        
        if (!settings || !settings.enabled) {
          return interaction.reply({ content: 'Anti-Nuke is disabled.', ephemeral: true });
        }
        
        const whitelistRoles = settings.whitelist_roles ? JSON.parse(settings.whitelist_roles) : [];
        const whitelistUsers = settings.whitelist_users ? JSON.parse(settings.whitelist_users) : [];
        
        const embed = new EmbedBuilder()
          .setTitle('🛡️ Anti-Nuke Status')
          .setColor(0x00ff00)
          .addFields(
            { name: 'Enabled', value: '✅ Yes', inline: true },
            { name: 'Webhook Limit', value: `${settings.webhook_limit}`, inline: true },
            { name: 'Channel Limit', value: `${settings.channel_limit}`, inline: true },
            { name: 'Role Limit', value: `${settings.role_limit}`, inline: true },
            { name: 'Ban Threshold', value: `${settings.ban_threshold}`, inline: true },
            { name: 'Kick Threshold', value: `${settings.kick_threshold}`, inline: true },
            { name: 'Whitelisted Roles', value: whitelistRoles.length > 0 ? whitelistRoles.length : '0', inline: true },
            { name: 'Whitelisted Users', value: whitelistUsers.length > 0 ? whitelistUsers.length : '0', inline: true }
          );
        
        await interaction.reply({ embeds: [embed], ephemeral: true });
        break;
      }
        
      case 'disable':
        db.setAntiNukeSettings(guildId, {
          enabled: 0,
          whitelistRoles: [],
          whitelistUsers: [],
          webhookLimit: 5,
          channelLimit: 5,
          roleLimit: 5,
          banThreshold: 5,
          kickThreshold: 10,
          botWhitelist: []
        });
        
        await interaction.reply('✅ Anti-Nuke disabled!');
        break;
    }
  }
};