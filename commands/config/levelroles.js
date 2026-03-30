const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

// Level roles management
module.exports = {
  data: new SlashCommandBuilder()
    .setName('levelroles')
    .setDescription('Manage level roles (auto-assign roles at certain levels)')
    .addStringOption(option =>
      option.setName('action')
        .setDescription('Action to perform')
        .setRequired(true)
        .addChoices(
          { name: 'Add', value: 'add' },
          { name: 'Remove', value: 'remove' },
          { name: 'List', value: 'list' }
        ))
    .addRoleOption(option =>
      option.setName('role')
        .setDescription('Role to assign')
        .setRequired(false))
    .addIntegerOption(option =>
      option.setName('level')
        .setDescription('Level required')
        .setMinValue(1)
        .setMaxValue(100)
        .setRequired(false)),
  permissions: [PermissionFlagsBits.Administrator],
  async execute(interaction, client) {
    const action = interaction.options.getString('action');
    const role = interaction.options.getRole('role');
    const level = interaction.options.getInteger('level');
    const guildId = interaction.guild.id;
    const db = require('../database');
    
    switch (action) {
      case 'add':
        if (!role || !level) {
          return interaction.reply({ content: '❌ Please provide both role and level!', ephemeral: true });
        }
        
        db.addLevelRole(guildId, role.id, level);
        
        await interaction.reply(`✅ Role ${role} will be assigned at level ${level}!`);
        break;
        
      case 'remove':
        if (!level) {
          return interaction.reply({ content: '❌ Please provide level!', ephemeral: true });
        }
        
        const db2 = require('../database').db;
        db2.prepare('DELETE FROM level_roles WHERE guild_id = ? AND level = ?').run(guildId, level);
        
        await interaction.reply(`✅ Level role for level ${level} removed!`);
        break;
        
      case 'list':
        const roles = db.getLevelRoles(guildId);
        
        if (roles.length === 0) {
          return interaction.reply({ content: 'No level roles set!', ephemeral: true });
        }
        
        const list = await Promise.all(roles.map(async (r) => {
          const role = await interaction.guild.roles.cache.get(r.role_id);
          return `Level ${r.level} -> ${role?.name || 'Unknown'}`;
        }));
        
        const embed = new EmbedBuilder()
          .setTitle('Level Roles')
          .setColor(0x00ff00)
          .setDescription(list.join('\n'));
        
        await interaction.reply({ embeds: [embed], ephemeral: true });
        break;
    }
  }
};