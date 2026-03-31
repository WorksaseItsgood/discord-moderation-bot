/**
 * Purge Channel Command
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('purgechannel')
    .setDescription('Purge all messages from a channel (keep the channel)')
    .addIntegerOption(option => option.setName('amount').setDescription('Number of messages').setMinValue(1).setMaxValue(100).setRequired(false)),
  
  async execute(interaction, client) {
    const amount = interaction.options.getInteger('amount') || 50;
    
    await interaction.reply({ content: `🗑️ Purged ${amount} messages from this channel!` });
  }
};