/**
 * Ticket Panel Command - Create a ticket panel with buttons
 */

const { SlashCommandBuilder, EmbedBuilder, ChannelType, ButtonStyle, ActionRowBuilder, ButtonBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ticket-panel')
    .setDescription('Create a ticket panel')
    .addChannelOption(option =>
      option.setName('channel')
        .setDescription('Channel to send panel to')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('title')
        .setDescription('Panel title')
        .setDefault('🎫 Support Tickets')
    )
    .addStringOption(option =>
      option.setName('description')
        .setDescription('Panel description')
        .setDefault('Click a button to create a ticket')
    ),
  
  async execute(interaction, client) {
    const channel = interaction.options.getChannel('channel');
    const title = interaction.options.getString('title');
    const description = interaction.options.getString('description');
    const guildId = interaction.guildId;
    
    // Check permissions
    if (!interaction.member.permissions.has('ManageChannels')) {
      return interaction.reply({ content: 'You need ManageChannels permission!', ephemeral: true });
    }
    
    // Create embed
    const embed = new EmbedBuilder()
      .setTitle(title)
      .setDescription(description)
      .setColor(0x00ff00)
      .addFields(
        { name: '📋 How it works', value: '1. Click a button below\n2. Describe your issue\n3. Wait for staff response' },
        { name: '⏰ Response Time', value: 'Staff will respond as soon as possible!' }
      );
    
    // Create buttons
    const generalButton = new ButtonBuilder()
      .setCustomId('ticket-general')
      .setLabel('💬 General Support')
      .setStyle(ButtonStyle.Primary);
    
    const reportButton = new ButtonBuilder()
      .setCustomId('ticket-report')
      .setLabel('🚹 Report a User')
      .setStyle(ButtonStyle.Danger);
    
    const bugButton = new ButtonBuilder()
      .setCustomId('ticket-bug')
      .setLabel('🐛 Bug Report')
      .setStyle(ButtonStyle.Secondary);
    
    const partnerButton = new ButtonBuilder()
      .setCustomId('ticket-partner')
      .setLabel('🤝 Partner Inquiry')
      .setStyle(ButtonStyle.Success);
    
    const row1 = new ActionRowBuilder()
      .addComponents(generalButton, reportButton);
    
    const row2 = new ActionRowBuilder()
      .addComponents(bugButton, partnerButton);
    
    await channel.send({ embeds: [embed], components: [row1, row2] });
    
    await interaction.reply({ content: `Ticket panel created in ${channel.toString()}!`, ephemeral: true });
  }
};