/**
 * Giveaway End Command - End a giveaway early
 */

const { SlashCommandBuilder, EmbedBuilder, MessageComponentCollector } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('giveaway-end')
    .setDescription('End a giveaway early')
    .addStringOption(option =>
      option.setName('message_id')
        .setDescription('Giveaway message ID')
        .setRequired(true)
    ),
  
  async execute(interaction, client) {
    const messageId = interaction.options.getString('message_id');
    const guildId = interaction.guildId;
    
    // Check permissions
    if (!interaction.member.permissions.has('ManageGuild')) {
      return interaction.reply({ content: 'You need ManageGuild permission!', ephemeral: true });
    }
    
    // Get giveaway
    const giveaway = client.dbManager.getGiveaway(messageId, guildId);
    
    if (!giveaway) {
      return interaction.reply({ content: 'Giveaway not found!', ephemeral: true });
    }
    
    // Find the message
    const channel = interaction.guild.channels.cache.find(ch => 
      ch.messages && ch.messages.cache.has(messageId)
    );
    
    if (!channel) {
      return interaction.reply({ content: 'Channel not found!', ephemeral: true });
    }
    
    // End the giveaway
    await require('./giveaway-create').endGiveaway(client, interaction.guild, messageId);
    
    await interaction.reply({ content: 'Giveaway ended!', ephemeral: true });
  }
};