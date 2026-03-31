/**
 * Webhook Command
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('webhook')
    .setDescription('Manage webhooks')
    .addStringOption(option => option.setName('action').setDescription('Action')
      .addChoices(
        { name: 'Create', value: 'create' },
        { name: 'List', value: 'list' },
        { name: 'Delete', value: 'delete' }
      ).setRequired(false)),
  
  async execute(interaction, client) {
    await interaction.reply({ content: '🪝 Webhook management panel' });
  }
};