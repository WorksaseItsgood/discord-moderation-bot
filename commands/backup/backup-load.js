/**
 * Backup Load Command - Load a server backup
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('backup-load')
    .setDescription('Load a server backup')
    .addStringOption(option =>
      option.setName('confirm')
        .setDescription('Type "confirm" to confirm')
        .setRequired(true)
    ),
  
  async execute(interaction, client) {
    const guild = interaction.guild;
    const guildId = interaction.guildId;
    const confirm = interaction.options.getString('confirm');
    
    // Check permissions
    if (!interaction.member.permissions.has('Administrator')) {
      return interaction.reply({ content: 'You need Administrator permission!', ephemeral: true });
    }
    
    if (confirm !== 'confirm') {
      return interaction.reply({ content: 'Type "confirm" to confirm backup load. This will overwrite server data!', ephemeral: true });
    }
    
    // Load backup file
    const backupPath = path.join(__dirname, '..', '..', 'backups', `${guildId}.json`);
    
    if (!fs.existsSync(backupPath)) {
      return interaction.reply({ content: 'No backup found for this server!', ephemeral: true });
    }
    
    await interaction.reply({ content: '⏳ Loading backup...', ephemeral: true });
    
    try {
      const backup = JSON.parse(fs.readFileSync(backupPath, 'utf8'));
      
      // Update guild settings
      if (backup.name && backup.name !== guild.name) {
        await guild.setName(backup.name);
      }
      
      let created = 0;
      let skipped = 0;
      
      // Create roles
      for (const roleData of backup.roles) {
        if (roleData.id === guild.id) continue; // Skip @everyone
        
        try {
          const existingRole = guild.roles.cache.get(roleData.id);
          if (!existingRole) {
            await guild.roles.create({
              id: roleData.id,
              name: roleData.name,
              color: roleData.color,
              hoist: roleData.hoist,
              position: roleData.position,
              permissions: roleData.permissions,
              mentionable: roleData.mentionable,
              unicodeEmoji: roleData.unicodeEmoji
            });
            created++;
          }
        } catch (e) {
          skipped++;
        }
      }
      
      // Create channels
      for (const channelData of backup.channels) {
        try {
          const existingChannel = guild.channels.cache.get(channelData.id);
          if (!existingChannel) {
            await guild.channels.create({
              id: channelData.id,
              name: channelData.name,
              type: channelData.type,
              topic: channelData.topic,
              nsfw: channelData.nsfw,
              rateLimitPerUser: channelData.rateLimitPerUser,
              bitrate: channelData.bitrate,
              userLimit: channelData.userLimit,
              parent: channelData.parentId
            });
            created++;
          }
        } catch (e) {
          skipped++;
        }
      }
      
      const embed = new EmbedBuilder()
        .setTitle('✅ Backup Loaded')
        .setDescription('Backup has been loaded!')
        .addFields(
          { name: '✅ Created', value: `${created}`, inline: true },
          { name: '⏭️ Skipped', value: `${skipped}`, inline: true }
        )
        .setColor(0x00ff00);
      
      await interaction.editReply({ embeds: [embed] });
    } catch (e) {
      console.error('[Backup] Error:', e);
      await interaction.editReply({ content: `Error: ${e.message}` });
    }
  }
};