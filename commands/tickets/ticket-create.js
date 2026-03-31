/**
 * Ticket Create Command - Create a ticket with button panel
 */

const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, PermissionFlagsBits } = require('discord.js');
const { ticket, success, error, COLORS } = require('../../utils/buttonComponents');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ticket-create')
    .setDescription('Create a support ticket')
    .addStringOption(option =>
      option.setName('category')
        .setDescription('Ticket category')
        .setRequired(false)
        .addChoices(
          { name: '💬 General', value: 'general' },
          { name: '🛠️ Support', value: 'support' },
          { name: '💰 Billing', value: 'billing' },
          { name: '🐛 Bug Report', value: 'bug' },
          { name: '💡 Suggestion', value: 'suggestion' }
        ))
    .addStringOption(option =>
      option.setName('description')
        .setDescription('Describe your issue')
        .setRequired(false)),
  
  async execute(interaction, client) {
    const category = interaction.options.getString('category') || 'general';
    const description = interaction.options.getString('description') || 'No description provided';
    
    const botAvatar = client.user?.displayAvatarURL() || 'https://cdn.discordapp.com/embed/avatars/0.png';
    
    // Check if user already has a ticket
    if (!client.tickets) {
      client.tickets = new Map();
    }
    
    const userTickets = Array.from(client.tickets.values()).filter(
      t => t.userId === interaction.user.id && t.guildId === interaction.guild.id && !t.closed
    );
    
    if (userTickets.length > 0) {
      const errorEmbed = error('❌ Ticket Exists', 'You already have an open ticket. Please close it first.', { thumbnail: botAvatar });
      return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }
    
    // Get ticket category info
    const categoryInfo = {
      general: { emoji: '💬', name: 'General Support', color: COLORS.secondary },
      support: { emoji: '🛠️', name: 'Technical Support', color: COLORS.music },
      billing: { emoji: '💰', name: 'Billing', color: COLORS.economy },
      bug: { emoji: '🐛', name: 'Bug Report', color: COLORS.error },
      suggestion: { emoji: '💡', name: 'Suggestion', color: COLORS.success }
    };
    
    const cat = categoryInfo[category];
    const ticketId = Math.random().toString(36).substr(2, 8).toUpperCase();
    
    // Create ticket channel
    const ticketChannel = await interaction.guild.channels.create({
      name: `ticket-${interaction.user.username}-${ticketId}`,
      type: 0, // Text channel
      topic: `Ticket for ${interaction.user.username} (${category})`,
      permissionOverwrites: [
        {
          id: interaction.guild.id,
          deny: ['ViewChannel']
        },
        {
          id: interaction.user.id,
          allow: ['ViewChannel', 'SendMessages', 'AttachFiles', 'EmbedLinks']
        }
      ]
    });
    
    // Store ticket info
    const ticketData = {
      id: ticketId,
      channelId: ticketChannel.id,
      userId: interaction.user.id,
      guildId: interaction.guild.id,
      category,
      description,
      createdAt: Date.now(),
      closed: false
    };
    
    client.tickets.set(ticketChannel.id, ticketData);
    
    // Create ticket embed
    const embed = new EmbedBuilder()
      .setColor(cat.color)
      .setAuthor({
        name: `${cat.emoji} Support Ticket`,
        iconURL: botAvatar
      })
      .setTitle(`${cat.emoji} Ticket #${ticketId}`)
      .setDescription(`**${interaction.user.username}** created a new ticket.`)
      .setThumbnail(interaction.user.displayAvatarURL())
      .setFooter({
        text: `CrowBot • Ticket ID: ${ticketId}`,
        iconURL: botAvatar
      })
      .setTimestamp()
      .addFields(
        { name: '👤 User', value: `${interaction.user}`, inline: true },
        { name: '📁 Category', value: cat.name, inline: true },
        { name: '📝 Description', value: description, inline: false }
      );
    
    // Ticket action buttons
    const buttonRow = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('ticket-add-user')
          .setLabel('➕ Add User')
          .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
          .setCustomId('ticket-close')
          .setLabel('✖️ Close Ticket')
          .setStyle(ButtonStyle.Danger)
      );
    
    // Send ticket message
    await ticketChannel.send({
      embeds: [embed],
      components: [buttonRow]
    });
    
    // Success embed for user
    const successEmbed = new EmbedBuilder()
      .setColor(COLORS.success)
      .setAuthor({
        name: '🎫 Ticket Created',
        iconURL: botAvatar
      })
      .setTitle('🎫 Ticket Created Successfully')
      .setDescription(`Your ticket has been created in ${ticketChannel}.`)
      .setThumbnail(botAvatar)
      .setFooter({
        text: 'CrowBot',
        iconURL: botAvatar
      })
      .setTimestamp()
      .addFields(
        { name: '🎫 Ticket ID', value: `\`${ticketId}\``, inline: true },
        { name: '📁 Category', value: cat.name, inline: true },
        { name: '💬 Channel', value: ticketChannel.toString(), inline: false }
      );
    
    await interaction.reply({ embeds: [successEmbed] });
  }
};