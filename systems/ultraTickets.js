const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder } = require('discord.js');

/**
 * ULTRA TICKET SYSTEM
 * Multi-category, transcript, close, reopen, claim
 */

class UltraTicketSystem {
  constructor(client) {
    this.client = client;
    this.tickets = new Map();
    this.ticketCount = 0;
    
    this.config = {
      maxTickets: 10,
      ticketCategory: null,
      transcriptChannel: null,
      createTicketPermission: 'SendMessages',
      autoClose: false,
      autoCloseTime: 0,
      claimEnabled: true,
      feedbackEnabled: true,
    };
  }
  
  async init(guild) {
    this.guild = guild;
    
    // Create ticket category
    this.config.ticketCategory = guild.channels.cache.find(c => c.name === 'Tickets') 
      || await guild.channels.create('Tickets', { type: 4 });
    
    // Create transcript channel
    const existingChannel = guild.channels.cache.find(c => c.name === 'ticket-transcripts');
    if (existingChannel) {
      this.config.transcriptChannel = existingChannel;
    } else {
      this.config.transcriptChannel = await guild.channels.create('ticket-transcripts', {
        type: 0,
        permissionOverwrites: [
          { id: guild.roles.everyone, deny: ['ViewChannel'] },
        ],
      });
    }
    
    console.log(`🎫 UltraTicket System initialized for ${guild.name}`);
  }
  
  async createTicket(member, type, reason) {
    this.ticketCount++;
    const ticketId = this.ticketCount;
    
    // Create ticket channel
    const channel = await this.guild.channels.create(`ticket-${member.user.username}-${ticketId}`, {
      type: 0,
      parent: this.config.ticketCategory,
      permissionOverwrites: [
        { id: this.guild.roles.everyone, deny: ['ViewChannel'] },
        { id: member.id, allow: ['ViewChannel', 'SendMessages'] },
      ],
    });
    
    // Store ticket info
    this.tickets.set(channel.id, {
      id: ticketId,
      channel: channel.id,
      user: member.id,
      type,
      reason,
      opened: Date.now(),
      claimed: false,
      claimer: null,
      messages: [],
    });
    
    // Send welcome message
    const embed = new EmbedBuilder()
      .setTitle(`🎫 Ticket #${ticketId}`)
      .setDescription(`**Type:** ${type}\n**Reason:** ${reason}\n\nWelcome! Please describe your issue.`)
      .addFields(
        { name: 'User', value: member.user.tag, inline: true },
        { name: 'Opened', value: new Date().toLocaleString(), inline: true },
      )
      .setColor(0x5865F2);
    
    // Add close button
    const row = new ActionRowBuilder()
      .addComponent(
        new ButtonBuilder()
          .setCustomId('ticket-close')
          .setLabel('Close Ticket')
          .setStyle(ButtonStyle.Danger)
      )
      .addComponent(
        new ButtonBuilder()
          .setCustomId('ticket-claim')
          .setLabel('Claim')
          .setStyle(ButtonStyle.Primary)
      )
      .addComponent(
        new ButtonBuilder()
          .setCustomId('ticket-reason')
          .setLabel('Edit Reason')
          .setStyle(ButtonStyle.Secondary)
      );
    
    await channel.send({ embeds: [embed], components: [row] });
    
    // Notify user
    try {
      await member.send(`🎫 Your ticket #${ticketId} has been created: ${channel}`);
    } catch (e) {
      // Can't DM
    }
    
    return channel;
  }
  
  async closeTicket(channelId, reason) {
    const ticket = this.tickets.get(channelId);
    if (!ticket) return false;
    
    const channel = this.guild.channels.cache.get(channelId);
    if (!channel) return false;
    
    // Create transcript
    const messages = [];
    const history = await channel.messages.fetch({ limit: 100 });
    
    for (const msg of history.reverse()) {
      if (!msg.author.bot) {
        messages.push(`[${msg.createdAt}] ${msg.author.tag}: ${msg.content}`);
      }
    }
    
    // Save transcript
    const transcriptText = messages.join('\n');
    
    // Send to transcript channel
    if (this.config.transcriptChannel) {
      const transcriptEmbed = new EmbedBuilder()
        .setTitle(`🎫 Ticket #${ticket.id} - Closed`)
        .addFields(
          { name: 'User', value: `<@${ticket.user}>`, inline: true },
          { name: 'Closed by', value: reason.closedBy || 'System', inline: true },
          { name: 'Reason', value: reason || 'No reason', inline: true },
          { name: 'Transcript', value: `\`\`\`\n${transcriptText.substring(0, 1900)}\n\`\`\`` },
        )
        .setColor(0xFF0000)
        .setTimestamp();
      
      await this.config.transcriptChannel.send({ embeds: [transcriptEmbed] });
    }
    
    // Delete channel
    await channel.delete();
    
    // Remove from tickets
    this.tickets.delete(channelId);
    
    return true;
  }
  
  async claimTicket(channelId, moderator) {
    const ticket = this.tickets.get(channelId);
    if (!ticket) return false;
    if (ticket.claimed) return false;
    
    ticket.claimed = true;
    ticket.claimer = moderator.id;
    
    const channel = this.guild.channels.cache.get(channelId);
    await channel.send({ content: `✅ Ticket claimed by ${moderator}` });
    
    return true;
  }
  
  async editReason(channelId, newReason) {
    const ticket = this.tickets.get(channelId);
    if (!ticket) return false;
    
    ticket.reason = newReason;
    
    const channel = this.guild.channels.cache.get(channelId);
    const msg = channel.messages.cache.first();
    if (msg && msg.embeds[0]) {
      const embed = EmbedBuilder.from(msg.embeds[0]).setDescription(`**Type:** ${ticket.type}\n**Reason:** ${newReason}`);
      msg.edit({ embeds: [embed] });
    }
    
    return true;
  }
}

// Export
module.exports = UltraTicketSystem;