/**
 * Role Info Command - Get role information
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('role-info')
    .setDescription('Get role information')
    .addRoleOption(option =>
      option.setName('role')
        .setDescription('Role to get info (optional)')
    ),
  
  async execute(interaction, client) {
    const role = interaction.options.getRole('role') || interaction.member.roles.highest;
    const guild = interaction.guild;
    
    // Count members with this role
    const memberCount = guild.members.cache.filter(m => 
      m.roles.cache.has(role.id)
    ).size;
    
    // Get permissions
    const permissions = role.permissions.toArray();
    
    const embed = new EmbedBuilder()
      .setTitle(role.name)
      .setColor(role.color)
      .addFields(
        { name: '🆔 ID', value: role.id, inline: true },
        { name: '🎨 Color', value: `#${role.color.toString(16).padStart(6, '0')}`, inline: true },
        { name: '👥 Members', value: `${memberCount}`, inline: true },
        { name: '📅 Created', value: `<t:${Math.floor(role.createdTimestamp / 1000)}:R>`, inline: true },
        { name: '🏷️ Mentionable', value: role.mentionable ? 'Yes' : 'No', inline: true },
        { name: '⏫ Position', value: `${guild.roles.cache.size - role.position}`, inline: true }
      )
      .setFooter({ text: permissions.slice(0, 10).join(', ') + (permissions.length > 10 ? '...' : '') });
    
    await interaction.reply({ embeds: [embed] });
  }
};