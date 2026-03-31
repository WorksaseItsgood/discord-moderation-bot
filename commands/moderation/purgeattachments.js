/**
 * Purgeattachments - Delete messages with attachments
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('purgeattachments')
    .setDescription('Delete messages with attachments')
    .addIntegerOption(option => option.setName('amount').setDescription('Number to check').setMinValue(1).setMaxValue(100).setRequired(false)),

  async execute(interaction, client) {
    const amount = interaction.options.getInteger('amount') || 50;

    const channel = interaction.channel;
    const messages = await channel.messages.fetch({ limit: amount });
    const attMessages = messages.filter(m => m.attachments.size > 0);

    await channel.bulkDelete(attMessages);

    const embed = new EmbedBuilder()
      .setTitle('📎 Attachment Messages Deleted')
      .addFields(
        { name: '🗑️ Deleted', value: attMessages.size + ' messages', inline: true }
      )
      .setColor(0x00ff00);

    await interaction.reply({ embeds: [embed] });
  }
};