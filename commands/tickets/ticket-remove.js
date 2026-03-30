/**
 * Ticket Remove Command - Remove a user from a ticket
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ticket-remove')
    .setDescription('Remove a user from the current ticket')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('User to remove')
        .setRequired(true)
    ),
  
  async execute(interaction, client) {
    const channel = interaction.channel;
    const guildId = interaction.guildId;
    const user = interaction.options.getUser('user');
    
    // Check if this is a ticket channel
    const ticket = client.dbManager.getTicket(channel.id, guildId);
    
    if (!ticket) {
      return interaction.reply({ content: 'This is not a ticket channel!', ephemeral: true });
    }
    
    // Check permissions
    const member = interaction.member;
    const isOwner = ticket.user_id === interaction.user.id;
    const isMod = member.permissions.has('ManageChannels');
    
    if (!isOwner && !isMod) {
      return interaction.reply({ content: 'You cannot remove users from this ticket!', ephemeral: true });
    }
    
    // Can't remove ticket owner
    if (user.id === ticket.user_id) {
      return interaction.reply({ content: 'You cannot remove the ticket owner!', ephemeral: true });
    }
    
    // Remove permissions
    try {
      await channel.permissionOverwrites.delete(user.id);
    } catch (e) {
      return interaction.reply({ content: 'Error removing user!', ephemeral: true });
    }
    
    const embed = new EmbedBuilder()
      .setTitle('👤 User Removed')
      .setDescription(`${user.toString()} has been removed from this ticket`)
      .setColor(0xffaa00);
    
    await interaction.reply({ embeds: [embed] });
  }
};