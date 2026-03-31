/**
 * Welcome Event - Welcome new members with beautiful embed
 */

const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { welcome, COLORS } = require('../utils/embedTemplates');
const { confirmButton } = require('../utils/buttonComponents');

module.exports = {
  name: 'guildMemberAdd',
  
  async execute(member, client) {
    const guild = member.guild;
    const botAvatar = client.user?.displayAvatarURL() || 'https://cdn.discordapp.com/embed/avatars/0.png';
    
    // Get welcome channel
    const welcomeChannel = guild.channels.cache.find(ch => 
      ch.name === 'welcome' || ch.name === 'welcomes' || ch.name === 'greeting'
    );
    
    if (!welcomeChannel) return;
    
    // Get member count
    const memberCount = guild.members.cache.size;
    
    // Get welcome settings (from database if available)
    const welcomeSettings = client.welcomeSettings?.get(guild.id) || {};
    
    // Create welcome embed
    const embed = new EmbedBuilder()
      .setColor(COLORS.success)
      .setAuthor({
        name: '🎉 Welcome!',
        iconURL: botAvatar
      })
      .setTitle(`Welcome to ${guild.name}!`)
      .setDescription(`Hey **${member.user.username}**! We're so glad you're here.`)
      .setThumbnail(member.displayAvatarURL())
      .setImage(guild.iconURL())
      .setFooter({
        text: `Member #${memberCount} • ${client.user?.username || 'Bot'}`,
        iconURL: botAvatar
      })
      .setTimestamp()
      .addFields(
        { name: '👤 Welcome!', value: 'Please read the rules and have fun!', inline: false },
        { name: '📋 Rules', value: 'Check out the rules channel to avoid issues!', inline: true },
        { name: '💬 Introduce', value: 'Tell us about yourself in the chat!', inline: true },
        { name: '🎉 Member Count', value: `**${memberCount}** members`, inline: false }
      );
    
    // Add role button if configured
    let components = [];
    if (welcomeSettings.autoRole) {
      const roleButton = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId('welcome-roles')
            .setLabel('🎭 Get Roles')
            .setStyle(ButtonStyle.Primary)
        );
      components = [roleButton];
    }
    
    await welcomeChannel.send({
      content: `Welcome ${member}! 🎉`,
      embeds: [embed],
      components
    });
    
    // Auto_assign role if configured
    if (welcomeSettings.autoRole) {
      const role = guild.roles.cache.get(welcomeSettings.autoRole);
      if (role) {
        try {
          await member.roles.add(role);
          console.log(`[Welcome] Added role ${role.name} to ${member.user.username}`);
        } catch (err) {
          console.error(`[Welcome] Error adding role:`, err.message);
        }
      }
    }
  }
};