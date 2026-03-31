/**
 * Slowmode Command
 */

const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('slowmode')
    .setDescription('Set slowmode for a channel')
    .addIntegerOption(option => option.setName('seconds').setDescription('Seconds between messages (0 to disable)').setMinValue(0).setMaxValue(21600).setRequired(false))
    .addChannelOption(option => option.setName('channel').setDescription('Channel').setRequired(false))
    .addStringOption(option => option.setName('reason').setDescription('Reason').setRequired(false)),

  async execute(interaction, client) {
    const seconds = interaction.options.getInteger('seconds') || 5;
    const channel = interaction.options.getChannel('channel') || interaction.channel;
    const reason = interaction.options.getString('reason') || 'Slowmode set';

    if (!interaction.member.permissions.has('ManageChannels')) {
      return interaction.reply({ content: '❌ You need Manage Channels permission!', ephemeral: true });
    }

    const embed = new EmbedBuilder()
      .setTitle('🐢 Slowmode ' + (seconds > 0 ? 'Enabled' : 'Disabled'))
      .setDescription('**Channel:** ' + channel.name + '\n**Rate:** ' + seconds + ' second(s)')
      .addFields(
        { name: '📝 Reason', value: reason, inline: true },
        { name: '👮 By', value: interaction.user.tag, inline: true }
      )
      .setColor(seconds > 0 ? 0xffaa00 : 0x00ff00);

    await interaction.reply({ embeds: [embed] });
  }
};