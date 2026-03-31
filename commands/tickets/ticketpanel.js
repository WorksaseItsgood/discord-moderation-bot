const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } = require('discord.js');

// Ticket panel command - create an interactive ticket panel
module.exports = {
  data: new SlashCommandBuilder()
    .setName('ticketpanel')
    .setDescription('Create a ticket creation panel')
    .addChannelOption(option =>
      option.setName('channel')
        .setDescription('Channel to send panel')
        .setRequired(true)),
  permissions: [PermissionFlagsBits.ManageChannels],
  async execute(interaction, client) {
    const channel = interaction.options.getChannel('channel');
    
    const embed = new EmbedBuilder()
      .setTitle('🎫 Support Tickets')
      .setDescription('Create a ticket for support with our server staff.')
      .setColor(0x00ff00)
      .addFields(
        { name: 'How it works', value: 'Click the button below to open a ticket. Our team will respond as soon as possible!' }
      );
    
    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('ticket-create')
          .setLabel('Create Ticket')
          .setStyle(ButtonStyle.Success)
          .setEmoji('🎫')
      );
    
    await channel.send({ embeds: [embed], components: [row] });
    
    await interaction.reply({
      content: `✅ Ticket panel sent to ${channel}!`,
      ephemeral: true
    });
  }
};