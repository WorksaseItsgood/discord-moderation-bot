/**
 * User Info Command - Get user information
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('user-info')
    .setDescription('Get user information')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('User to check (optional)')
    ),
  
  async execute(interaction, client) {
    const user = interaction.options.getUser('user') || interaction.user;
    const member = interaction.options.getMember('user') || interaction.member;
    
    // Get join position
    const joinPosition = Array.from(interaction.guild.members.cache
      .sort((a, b) => a.joinedAt - b.joinedAt)
      .keys())
      .indexOf(user.id) + 1;
    
    // Roles
    const roles = member?.roles.cache.filter(r => r.id !== interaction.guild.id).map(r => r.toString()).join(', ') || 'None';
    
    const embed = new EmbedBuilder()
      .setTitle(user.tag)
      .setThumbnail(user.displayAvatarURL({ size: 256 }))
      .setColor(member?.displayColor || 0x0099ff)
      .addFields(
        { name: '🆔 ID', value: user.id, inline: true },
        { name: '📅 Account Created', value: `<t:${Math.floor(user.createdTimestamp / 1000)}:R>`, inline: true },
        { name: '🚪 Joined Server', value: `<t:${Math.floor(member?.joinedTimestamp / 1000)}:R>`, inline: true },
        { name: '🔢 Join Position', value: `#${joinPosition}`, inline: true },
        { name: '🎭 Roles', value: roles },
        { name: '⏰ Boost Status', value: member?.premiumSince ? 'Since <t:' + Math.floor(member.premiumSinceTimestamp / 1000) + ':R>' : 'Not boosting' }
      )
      .setFooter({ text: 'User Info' });
    
    await interaction.reply({ embeds: [embed] });
  }
};