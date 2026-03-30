/**
 * Ticket Add Command - Add a user to a ticket
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ticket-add')
    .setDescription('Add a user to the current ticket')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('User to add')
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
      return interaction.reply({ content: 'You cannot add users to this ticket!', ephemeral: true });
    }
    
    // Add permissions
    try {
      await channel.permissionOverwrites.edit(user.id, {
        ViewChannel: true,
        SendMessages: true,
        ReadMessageHistory: true
      });
    } catch (e) {
      return interaction.reply({ content: 'Error adding user!', ephemeral: true });
    }
    
    const embed = new EmbedBuilder()
      .setTitle('👤 User Added')
      .setDescription(`${user.toString()} has been added to this ticket`)
      .setColor(0x00ff00);
    
    await interaction.reply({ embeds: [embed] });
    
    // Notify the added user
    try {
      await user.send({ 
        content: `You've been added to a ticket: ${channel.toString()}`,
        embeds: [embed]
      });
    } catch (e) {
      // Can't DM user, that's ok
    }
  }
};