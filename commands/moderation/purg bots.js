/**
 * Purgebots - Delete bot messages
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('purgebots')
    .setDescription('Delete bot messages')
    .addIntegerOption(option => option.setName('amount').setDescription('Number of messages').setMinValue(1).setMaxValue(100).setRequired(false)),

  async execute(interaction, client) {
    const amount = interaction.options.getInteger('amount') || 50;

    const channel = interaction.channel;
    const messages = await channel.messages.fetch({ limit: amount });
    const botMessages = messages.filter(m => m.author.bot);

    await channel.bulkDelete(botMessages);

    const embed = new EmbedBuilder()
      .setTitle('🤖 Bot Messages Deleted')
      .addFields(
        { name: '🗑️ Deleted', value: botMessages.size + ' messages', inline: true }
      )
      .setColor(0x00ff00);

    await interaction.reply({ embeds: [embed] });
  }
};