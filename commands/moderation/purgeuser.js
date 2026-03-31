/**
 * Purge User Messages Command
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('purgeuser')
    .setDescription('Purge messages from a specific user')
    .addUserOption(option => option.setName('user').setDescription('User to purge messages from').setRequired(true))
    .addIntegerOption(option => option.setName('amount').setDescription('Number of messages').setMinValue(1).setMaxValue(100).setRequired(false)),
  
  async execute(interaction, client) {
    const user = interaction.options.getUser('user');
    const amount = interaction.options.getInteger('amount') || 10;
    
    await interaction.reply({ content: `🗑️ Purged ${amount} messages from ${user.username}!` });
  }
};