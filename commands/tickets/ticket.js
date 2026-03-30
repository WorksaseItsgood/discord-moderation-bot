const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

// Ticket command - create a ticket
module.exports = {
  data: new SlashCommandBuilder()
    .setName('ticket')
    .setDescription('Create a support ticket')
    .addStringOption(option =>
      option.setName('category')
        .setDescription('Ticket category')
        .setRequired(false)
        .addChoices(
          { name: 'General Support', value: 'general' },
          { name: 'Report a User', value: 'report' },
          { name: 'Bug Report', value: 'bug' },
          { name: 'Partnership', value: 'partner' }
        ))
    .addStringOption(option =>
      option.setName('description')
        .setDescription('Describe your issue')
        .setRequired(false)),
  permissions: [],
  async execute(interaction, client) {
    const category = interaction.options.getString('category') || 'general';
    const description = interaction.options.getString('description') || 'No description provided';
    const guild = interaction.guild;
    const user = interaction.user;
    const db = require('../database');
    
    // Check for existing open tickets
    const existingTickets = db.getOpenTickets(guild.id, user.id);
    if (existingTickets.length > 0) {
      const ticketChannel = guild.channels.cache.get(existingTickets[0].channel_id);
      return interaction.reply({
        content: `❌ You already have an open ticket: ${ticketChannel}`,
        ephemeral: true
      });
    }
    
    // Create ticket channel
    const ticketId = db.createTicket(guild.id, '', user.id, category);
    const channelName = `ticket-${user.username.toLowerCase()}${user.discriminator}`;
    
    const ticketChannel = await guild.channels.create(channelName, {
      type: 0, // text
      parent: interaction.options.getChannel('category'), // optional category
      permissionOverwrites: [
        {
          id: guild.roles.everyone,
          deny: ['ViewChannel']
        },
        {
          id: user.id,
          allow: ['ViewChannel', 'SendMessages', 'AttachFiles']
        }
      ]
    });
    
    // Update ticket with channel ID
    const db2 = require('../database').db;
    db2.prepare('UPDATE tickets SET channel_id = ? WHERE ticket_id = ?').run(ticketChannel.id, ticketId);
    
    // Create ticket embed
    const categoryNames = {
      general: 'General Support',
      report: 'Report a User',
      bug: 'Bug Report',
      partner: 'Partnership'
    };
    
    const embed = new EmbedBuilder()
      .setTitle(`🎫 Support Ticket #${ticketId.slice(-6)}`)
      .setColor(0x00ff00)
      .setDescription(description)
      .addFields(
        { name: 'Category', value: categoryNames[category], inline: true },
        { name: 'Created By', value: user.toString(), inline: true }
      ));
    
    // Add close button
    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('ticket-close')
          .setLabel('Close Ticket')
          .setStyle(ButtonStyle.Danger)
          .setEmoji('🔒')
      );
    
    await ticketChannel.send({ embeds: [embed], components: [row] });
    
    await interaction.reply({
      content: `✅ Your ticket has been created: ${ticketChannel}`,
      ephemeral: true
    });
    
    // Log to mod channel
    const logChannel = guild.channels.cache.find(ch => 
      ch.name === 'mod-logs' || ch.name === 'tickets'
    );
    if (logChannel) {
      await logChannel.send({ embeds: [embed] });
    }
  }
};