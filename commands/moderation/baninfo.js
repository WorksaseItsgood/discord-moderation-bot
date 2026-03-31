const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

// Baninfo command - Get info about a ban
module.exports = {
  data: new SlashCommandBuilder()
    .setName('baninfo')
    .setDescription('Get information about a banned user')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('User to get ban info for')
        .setRequired(true)),
  permissions: [PermissionFlagsBits.BanMembers],
  async execute(interaction, client) {
    const user = interaction.options.getUser('user');
    
    try {
      const banEntry = await interaction.guild.bans.fetch(user.id);
      
      if (!banEntry) {
        return interaction.reply({ 
          content: `❌ ${user} is not banned!`,
          ephemeral: true 
        });
      }
      
      const embed = new EmbedBuilder()
        .setTitle('🚫 Ban Information')
        .setColor(0xff0000)
        .addFields(
          { name: 'User', value: `${user} (${user.id})`, inline: true },
          { name: 'Banned', value: banEntry.user.tag, inline: true }
        );
      
      if (banEntry.reason) {
        embed.addFields({ name: 'Reason', value: banEntry.reason });
      }
      
      // Try to fetch case number from audit log
      const auditLogs = await interaction.guild.fetchAuditLogs({ 
        type: 'MEMBER_BAN_ADD', 
        limit: 100 
      });
      
      const banLog = auditLogs.entries.find(e => e.target.id === user.id);
      if (banLog) {
        embed.addFields({ 
          name: 'Banned By', 
          value: banLog.executor.tag,
          inline: true 
        });
        embed.addFields({ 
          name: 'Ban Date', 
          value: new Date(banLog.createdTimestamp).toLocaleString(),
          inline: true 
        });
      }
      
      await interaction.reply({ embeds: [embed] });
      
    } catch (error) {
      await interaction.reply({ 
        content: `❌ Error fetching ban info: ${error.message}`,
        ephemeral: true 
      });
    }
  }
};