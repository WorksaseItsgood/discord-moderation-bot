/**
 * Unlock Command
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('unlock')
    .setDescription('Unlock a channel')
    .addChannelOption(option => option.setName('channel').setDescription('Channel to unlock').setRequired(false))
    .addStringOption(option => option.setName('reason').setDescription('Reason').setRequired(false)),

  async execute(interaction, client) {
    const channel = interaction.options.getChannel('channel') || interaction.channel;
    const reason = interaction.options.getString('reason') || 'Unlocked by moderator';

    const embed = new EmbedBuilder()
      .setTitle('🔓 Channel Unlocked')
      .setDescription('**Channel:** ' + channel.name)
      .addFields(
        { name: '👮 By', value: interaction.user.tag, inline: true }
      )
      .setColor(0x00ff00);

    await interaction.reply({ embeds: [embed] });
  }
};