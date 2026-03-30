/**
 * Backup Create Command - Create server backup
 */

const { SlashCommandBuilder, EmbedBuilder, AttachmentBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('backup-create')
    .setDescription('Create a server backup'),
  
  async execute(interaction, client) {
    const guild = interaction.guild;
    const guildId = interaction.guildId;
    
    // Check permissions
    if (!interaction.member.permissions.has('Administrator')) {
      return interaction.reply({ content: 'You need Administrator permission!', ephemeral: true });
    }
    
    await interaction.reply({ content: '⏳ Creating backup...', ephemeral: true });
    
    try {
      const backup = {
        name: guild.name,
        createdAt: Date.now(),
        iconURL: guild.iconURL(),
        bannerURL: guild.bannerURL(),
        splashURL: guild.splashURL(),
        description: guild.description,
        verificationLevel: guild.verificationLevel,
        explicitContentFilter: guild.explicitContentFilter,
        defaultMessageNotifications: guild.defaultMessageNotifications,
        mfaLevel: guild.mfaLevel,
        features: guild.features,
        // Channels
        channels: [],
        // Roles
        roles: [],
        // Emojis
        emojis: []
      };
      
      // Get all channels
      for (const channel of guild.channels.cache.values()) {
        backup.channels.push({
          id: channel.id,
          name: channel.name,
          type: channel.type,
          parentId: channel.parentId,
          position: channel.position,
          topic: channel.topic,
          nsfw: channel.nsfw,
          rateLimitPerUser: channel.rateLimitPerUser,
          bitrate: channel.bitrate,
          userLimit: channel.userLimit,
          permissionOverwrites: Array.from(channel.permissionOverwrites.values()).map(overwrite => ({
            id: overwrite.id,
            type: overwrite.type,
            allow: overwrite.allow.toArray(),
            deny: overwrite.deny.toArray()
          }))
        });
      }
      
      // Get all roles
      for (const role of guild.roles.cache.values()) {
        backup.roles.push({
          id: role.id,
          name: role.name,
          color: role.color,
          hoist: role.hoist,
          position: role.position,
          permissions: role.permissions.toArray(),
          mentionable: role.mentionable,
          unicodeEmoji: role.unicodeEmoji
        });
      }
      
      // Get emojis
      for (const emoji of guild.emojis.cache.values()) {
        backup.emojis.push({
          id: emoji.id,
          name: emoji.name,
          animated: emoji.animated
        });
      }
      
      // Save backup file
      const backupDir = path.join(__dirname, '..', 'backups');
      if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true });
      }
      
      const backupPath = path.join(backupDir, `${guildId}.json`);
      fs.writeFileSync(backupPath, JSON.stringify(backup, null, 2));
      
      const embed = new EmbedBuilder()
        .setTitle('✅ Backup Created')
        .setDescription(`Backup saved as \`${guildId}.json\``)
        .addFields(
          { name: '📁 Channels', value: `${backup.channels.length}`, inline: true },
          { name: '🎭 Roles', value: `${backup.roles.length}`, inline: true },
          { name: '😀 Emojis', value: `${backup.emojis.length}`, inline: true }
        )
        .setColor(0x00ff00);
      
      await interaction.editReply({ embeds: [embed] });
    } catch (e) {
      console.error('[Backup] Error:', e);
      await interaction.editReply({ content: `Error: ${e.message}` });
    }
  }
};