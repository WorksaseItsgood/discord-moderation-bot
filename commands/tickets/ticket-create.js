/**
 * Ticket Create Command - Create a support ticket
 */

const { SlashCommandBuilder, EmbedBuilder, ChannelType, ButtonStyle, ActionRowBuilder, ButtonBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ticket-create')
    .setDescription('Create a support ticket')
    .addStringOption(option =>
      option.setName('category')
        .setDescription('Ticket category')
        .addChoices(
          { name: 'General Support', value: 'general' },
          { name: 'Report a User', value: 'report' },
          { name: 'Bug Report', value: 'bug' },
          { name: 'Partner Inquiry', value: 'partner' }
        )
    )
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('Reason for ticket')
        .setRequired(true)
    ),
  
  async execute(interaction, client) {
    const category = interaction.options.getString('category') || 'general';
    const reason = interaction.options.getString('reason');
    const guildId = interaction.guildId;
    const userId = interaction.user.id;
    
    // Check if user already has an open ticket
    const existingTickets = client.dbManager.getOpenTickets(guildId);
    const userTickets = existingTickets.filter(t => t.user_id === userId);
    
    if (userTickets.length > 0) {
      const channel = interaction.guild.channels.cache.get(userTickets[0].channel_id);
      return interaction.reply({ 
        content: `You already have an open ticket: ${channel ? channel.toString() : 'unknown channel'}`,
        ephemeral: true 
      });
    }
    
    // Get ticket config
    const ticketCategoryId = client.dbManager.getSetting('ticket_category', guildId);
    const ticketLogChannelId = client.dbManager.getSetting('ticket_log_channel', guildId);
    
    // Create ticket channel
    const channelName = `ticket-${interaction.user.username.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now().toString().slice(-4)}`;
    
    let ticketChannel;
    
    try {
      ticketChannel = await interaction.guild.channels.create({
        name: channelName,
        type: ChannelType.GuildText,
        parent: ticketCategoryId,
        permissionOverwrites: [
          {
            id: interaction.guild.roles.everyone,
            deny: ['ViewChannel']
          },
          {
            id: userId,
            allow: ['ViewChannel', 'SendMessages', 'ReadMessageHistory']
          },
          {
            id: interaction.client.user.id,
            allow: ['ViewChannel', 'SendMessages', 'ReadMessageHistory', 'ManageChannels']
          }
        ]
      });
    } catch (e) {
      console.error('[Ticket] Error creating channel:', e);
      return interaction.reply({ content: 'Error creating ticket channel!', ephemeral: true });
    }
    
    // Save ticket to database
    client.dbManager.createTicket(ticketChannel.id, userId, guildId, category);
    
    // Send ticket embed
    const embed = new EmbedBuilder()
      .setTitle('🎫 New Support Ticket')
      .setColor(0x00ff00)
      .addFields(
        { name: '👤 User', value: interaction.user.toString(), inline: true },
        { name: '📁 Category', value: category.charAt(0).toUpperCase() + category.slice(1), inline: true },
        { name: '📝 Reason', value: reason }
      )
      .setFooter({ text: `Ticket ID: ${ticketChannel.id}` })
      .setTimestamp();
    
    // Add close button
    const closeButton = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('ticket-close')
          .setLabel('🔒 Close Ticket')
          .setStyle(ButtonStyle.Danger)
      );
    
    await ticketChannel.send({ 
      embeds: [embed], 
      components: [closeButton],
      content: interaction.user.toString()
    });
    
    // Notify user
    await interaction.reply({ 
      content: `Your ticket has been created: ${ticketChannel.toString()}`,
      ephemeral: true 
    });
    
    // Log to ticket log channel
    if (ticketLogChannelId) {
      const logChannel = interaction.guild.channels.cache.get(ticketLogChannelId);
      if (logChannel) {
        const logEmbed = new EmbedBuilder()
          .setTitle('🎫 Ticket Created')
          .setColor(0x00ff00)
          .addFields(
            { name: '👤 User', value: interaction.user.toString(), inline: true },
            { name: '📁 Channel', value: ticketChannel.toString(), inline: true },
            { name: '📝 Reason', value: reason }
          );
        
        await logChannel.send({ embeds: [logEmbed] });
      }
    }
  }
};