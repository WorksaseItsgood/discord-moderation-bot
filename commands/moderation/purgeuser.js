/**
 * Purgeuser - Delete messages from user
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('purgeuser')
    .setDescription('Delete messages from a user')
    .addUserOption(option => option.setName('user').setDescription('User').setRequired(true))
    .addIntegerOption(option => option.setName('amount').setDescription('Number of messages').setMinValue(1).setMaxValue(100).setRequired(false)),

  async execute(interaction, client) {
    const user = interaction.options.getUser('user');
    const amount = interaction.options.getInteger('amount') || 50;

    const channel = interaction.channel;
    const messages = await channel.messages.fetch({ limit: amount });
    const userMessages = messages.filter(m => m.author.id === user.id);

    await channel.bulkDelete(userMessages);

    const embed = new EmbedBuilder()
      .setTitle('🗑️ User Messages Deleted')
      .addFields(
        { name: '👤 User', value: user.tag, inline: true },
        { name: '🗑️ Deleted', value: userMessages.size + ' messages', inline: true },
        { name: '👮 By', value: interaction.user.tag, inline: true }
      )
      .setColor(0x00ff00);

    await interaction.reply({ embeds: [embed] });
  }
};