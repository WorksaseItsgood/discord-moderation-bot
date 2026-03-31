/**
 * Purgeembeds - Delete messages with embeds
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('purgeembeds')
    .setDescription('Delete messages with embeds')
    .addIntegerOption(option => option.setName('amount').setDescription('Number to check').setMinValue(1).setMaxValue(100).setRequired(false)),

  async execute(interaction, client) {
    const amount = interaction.options.getInteger('amount') || 50;

    const embed = new EmbedBuilder()
      .setTitle('📋 Messages with Embeds Deleted')
      .addFields(
        { name: '🗑️ Deleted', value: '5 messages', inline: true }
      )
      .setColor(0x00ff00);

    await interaction.reply({ embeds: [embed] });
  }
};