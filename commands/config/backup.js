const { SlashCommandBuilder, EmbedBuilder, AttachmentBuilder, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');
const path = require('path');

// Backup command - export server configuration
module.exports = {
  data: new SlashCommandBuilder()
    .setName('backup')
    .setDescription('Backup or restore server configuration')
    .addStringOption(option =>
      option.setName('action')
        .setDescription('Action to perform')
        .setRequired(true)
        .addChoices(
          { name: 'Create Backup', value: 'create' },
          { name: 'Restore Backup', value: 'restore' },
          { name: 'List Backups', value: 'list' }
        )),
  permissions: [PermissionFlagsBits.Administrator],
  async execute(interaction, client) {
    const action = interaction.options.getString('action');
    const guild = interaction.guild;
    const db = require('../database');
    
    switch (action) {
      case 'create':
        await createBackup(interaction, guild, db);
        break;
        
      case 'restore':
        await interaction.reply({
          content: '⚠️ To restore a backup, please provide the backup file ID or upload the backup JSON file.',
          ephemeral: true
        });
        break;
        
      case 'list':
        // List recent backups (simplified - would need actual backup storage)
        const embed = new EmbedBuilder()
          .setTitle('💾 Server Backups')
          .setColor(0x00ff00)
          .setDescription('No backups found. Use `/backup create` to create one.');
        
        await interaction.reply({ embeds: [embed], ephemeral: true });
        break;
    }
  }
};

async function createBackup(interaction, guild, db) {
  const backup = {
    version: '1.0',
    createdAt: new Date().toISOString(),
    guild: {
      name: guild.name,
      id: guild.id,
      icon: guild.icon,
      banner: guild.banner
    },
    roles: [...guild.roles.cache.values()].map(r => ({
      name: r.name,
      id: r.id,
      color: r.color,
      hoist: r.hoist,
      position: r.position,
      permissions: r.permissions.bitfield,
      mentionable: r.mentionable
    })),
    channels: [...guild.channels.cache.values()].map(c => ({
      name: c.name,
      id: c.id,
      type: c.type,
      parentId: c.parentId,
      position: c.position,
      permissionOverwrites: [...(c.permissionOverwrites?.values() || [])].map(ow => ({
        id: ow.id,
        allow: ow.allow.bitfield,
        deny: ow.deny.bitfield
      }))
    })),
    emojis: [...guild.emojis.cache.values()].map(e => ({
      name: e.name,
      id: e.id,
      animated: e.animated
    })),
    settings: db.getWelcomeSettings(guild.id),
    antinuke: db.getAntiNukeSettings(guild.id),
    customCommands: db.getCustomCommands(guild.id),
    levelRoles: db.getLevelRoles(guild.id)
  };
  
  const backupFile = `backup-${guild.id}-${Date.now()}.json`;
  fs.writeFileSync(backupFile, JSON.stringify(backup, null, 2));
  
  const attach = new AttachmentBuilder(backupFile)
    .setName(`backup-${guild.name.replace(/[^a-z0-9]/gi, '_')}.json`);
  
  const embed = new EmbedBuilder()
    .setTitle('✅ Backup Created')
    .setColor(0x00ff00)
    .addFields(
      { name: 'Server', value: guild.name, inline: true },
      { name: 'Roles', value: String(backup.roles.length), inline: true },
      { name: 'Channels', value: String(backup.channels.length), inline: true }
    );
  
  await interaction.reply({ embeds: [embed], files: [attach] });
  
  // Clean up temp file
  fs.unlinkSync(backupFile);
}