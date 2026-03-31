/**
 * Purge - Delete messages
 */

const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('purge')
    .setDescription('Delete messages')
    .addIntegerOption(option => option.setName('amount').setDescription('Number of messages').setMinValue(1).setMaxValue(100).setRequired(true))
    .addStringOption(option => option.setName('reason').setDescription('Reason').setRequired(false)),

  async execute(interaction, client) {
    const amount = interaction.options.getInteger('amount');
    const reason = interaction.options.getString('reason') || 'Message purge';

    if (!interaction.member.permissions.has('ManageMessages')) {
      return interaction.reply({ content: '❌ You need Manage Messages permission!', ephemeral: true });
    }

    const channel = interaction.channel;
    const messages = await channel.messages.fetch({ limit: amount });

    try {
      await channel.bulkDelete(messages);

      const embed = new EmbedBuilder()
        .setTitle('🗑️ Messages Deleted')
        .addFields(
          { name: '🗑️ Deleted', value: amount + ' messages', inline: true },
          { name: '📝 Reason', value: reason, inline: true },
          { name: '👮 By', value: interaction.user.tag, inline: true }
        )
        .setColor(0x00ff00);

      await interaction.reply({ embeds: [embed] });
    } catch (e) {
      await interaction.reply({ content: '❌ Failed: ' + e.message, ephemeral: true });
    }
  }
};