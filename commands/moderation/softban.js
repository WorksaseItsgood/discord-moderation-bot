const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

// Softban command - Ban and immediately unban (to delete messages)
module.exports = {
  data: new SlashCommandBuilder()
    .setName('softban')
    .setDescription('Ban and immediately unban to delete user messages')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('User to softban')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('Reason for softban')
        .setRequired(false))
    .addIntegerOption(option =>
      option.setName('days')
        .setDescription('Days of messages to delete (0-7)')
        .setRequired(false)
        .setMinValue(0)
        .setMaxValue(7)),
  permissions: [PermissionFlagsBits.BanMembers],
  async execute(interaction, client) {
    const user = interaction.options.getUser('user');
    const reason = interaction.options.getString('reason') || 'No reason provided';
    const days = interaction.options.getInteger('days') || 1;
    
    const member = interaction.guild.members.cache.get(user.id);
    
    try {
      // Ban the user
      await interaction.guild.bans.create(user.id, {
        reason: `Softban: ${reason}`,
        deleteMessageSeconds: days * 24 * 60 * 60
      });
      
      // Immediately unban
      await interaction.guild.bans.remove(user.id, 'Softban complete');
      
      const embed = new EmbedBuilder()
        .setTitle('⚡ Softban Complete')
        .setColor(0xff6600)
        .addFields(
          { name: 'User', value: `${user} (${user.id})`, inline: true },
          { name: 'Reason', value: reason, inline: true },
          { name: 'Messages Deleted', value: `${days} day(s)`, inline: true }
        );
      
      await interaction.reply({ embeds: [embed] });
      
      // Log to mod log
      const logChannel = interaction.guild.channels.cache.find(ch => 
        ch.name === 'mod-logs' || ch.name === 'moderation-logs'
      );
      
      if (logChannel) {
        await logChannel.send({ embeds: [embed] });
      }
      
    } catch (error) {
      await interaction.reply({ 
        content: `❌ Error: ${error.message}`,
        ephemeral: true 
      });
    }
  }
};