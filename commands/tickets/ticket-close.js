/**
 * Ticket Close Command - Close a support ticket
 */

const { SlashCommandBuilder, EmbedBuilder, AttachmentBuilder } = require('discord.js');
const { createTranscript } = require('discord-html-transcripts');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ticket-close')
    .setDescription('Close the current ticket')
    .addBooleanOption(option =>
      option.setName('transcript')
        .setDescription('Generate transcript (default: true)')
    ),
  
  async execute(interaction, client) {
    const channel = interaction.channel;
    const guildId = interaction.guildId;
    const transcript = interaction.options.getBoolean('transcript') !== false;
    
    // Check if this is a ticket channel
    const ticket = client.dbManager.getTicket(channel.id, guildId);
    
    if (!ticket) {
      return interaction.reply({ content: 'This is not a ticket channel!', ephemeral: true });
    }
    
    // Check if user can close (ticket owner or moderator)
    const isOwner = ticket.user_id === interaction.user.id;
    const isMod = interaction.member.permissions.has('ManageChannels');
    
    if (!isOwner && !isMod) {
      return interaction.reply({ content: 'You cannot close this ticket!', ephemeral: true });
    }
    
    // Generate transcript if requested
    let transcriptAttachment = null;
    
    if (transcript) {
      try {
        const transcriptFile = await createTranscript(channel, {
          limit: -1,
          filename: `ticket-${channel.id}.html`
        });
        transcriptAttachment = new AttachmentBuilder(transcriptFile, { name: `transcript-${channel.id}.html` });
      } catch (e) {
        console.error('[Ticket] Error generating transcript:', e);
      }
    }
    
    // Close ticket in database
    client.dbManager.closeTicket(channel.id, guildId);
    
    // Send close message
    const closeEmbed = new EmbedBuilder()
      .setTitle('🔒 Ticket Closed')
      .setColor(0xff0000)
      .addFields(
        { name: '👤 Closed by', value: interaction.user.toString() },
        { name: '📅 Closed at', value: new Date().toISOString() }
      )
      .setTimestamp();
    
    // Send to log channel
    const logChannelId = client.dbManager.getSetting('ticket_log_channel', guildId);
    if (logChannelId) {
      const logChannel = interaction.guild.channels.cache.get(logChannelId);
      if (logChannel) {
        await logChannel.send({ 
          embeds: [closeEmbed], 
          files: transcriptAttachment ? [transcriptAttachment] : [] 
        });
      }
    }
    
    // Delete channel after delay
    await interaction.reply({ content: 'Ticket closed! Deleting channel in 5 seconds...', ephemeral: true });
    
    setTimeout(async () => {
      try {
        await channel.delete();
      } catch (e) {
        console.error('[Ticket] Error deleting channel:', e);
      }
    }, 5000);
  }
};