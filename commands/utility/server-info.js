/**
 * Server Info Command - Get server information
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('server-info')
    .setDescription('Get server information'),
  
  async execute(interaction, client) {
    const guild = interaction.guild;
    
    // Count channels
    const textChannels = guild.channels.cache.filter(c => c.type === 0).size;
    const voiceChannels = guild.channels.cache.filter(c => c.type === 2).size;
    const categoryChannels = guild.channels.cache.filter(c => c.type === 4).size;
    
    // Count roles
    const roles = guild.roles.cache.size - 1; // Exclude @everyone
    
    // Count emojis
    const emojis = guild.emojis.cache.size;
    const animatedEmojis = guild.emojis.cache.filter(e => e.animated).size;
    
    // Get verification level
    const verifyLevels = {
      0: 'None',
      1: 'Low',
      2: 'Medium',
      3: 'High',
      4: 'Highest'
    };
    
    // Get explicit content filter
    const contentFilters = {
      0: 'None',
      1: 'Medium',
      2: 'High'
    };
    
    const embed = new EmbedBuilder()
      .setTitle(guild.name)
      .setThumbnail(guild.iconURL({ size: 256 }))
      .setColor(0x0099ff)
      .addFields(
        { name: '📋 General', value: `**ID:** ${guild.id}`, inline: true },
        { name: '👤 Owner', value: `${guild.ownerId ? (await client.users.fetch(guild.ownerId)).tag : 'Unknown'}`, inline: true },
        { name: '📅 Created', value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:R>`, inline: true },
        { name: '👥 Members', value: `**Total:** ${guild.memberCount}`, inline: true },
        { name: '👤 Humans', value: `**Bots:** ${guild.members.cache.filter(m => m.bot).size}`, inline: true },
        { name: '💬 Channels', value: `${textChannels} text, ${voiceChannels} voice`, inline: true },
        { name: '🎭 Roles', value: `${roles}`, inline: true },
        { name: '😀 Emojis', value: `${emojis} (${animatedEmojis} animated)`, inline: true },
        { name: '🔒 Security', value: `**Verification:** ${verifyLevels[guild.verificationLevel]}\n**Content Filter:** ${contentFilters[guild.explicitContentFilter]}`, inline: true },
        { name: '🌍 Features', value: guild.features.join(', ') || 'None' }
      )
      .setFooter({ text: `Server since: ${new Date(guild.me?.joinedTimestamp).toLocaleDateString()}` });
    
    await interaction.reply({ embeds: [embed] });
  }
};