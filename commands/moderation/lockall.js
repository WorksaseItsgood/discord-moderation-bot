/**
 * Lockall - Lock all channels
 */

const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('lockall')
    .setDescription('Lock all channels')
    .addStringOption(option => option.setName('reason').setDescription('Reason').setRequired(false)),

  async execute(interaction, client) {
    const reason = interaction.options.getString('reason') || 'Server lockdown';

    if (!interaction.member.permissions.has('ManageChannels')) {
      return interaction.reply({ content: '❌ You need Manage Channels permission!', ephemeral: true });
    }

    const textChannels = interaction.guild.channels.cache.filter(c => c.type === 0);
    const voiceChannels = interaction.guild.channels.cache.filter(c => c.type === 2);

    const embed = new EmbedBuilder()
      .setTitle('🔒 All Channels Locked')
      .setDescription('**Text Channels:** ' + textChannels.size + '\n**Voice Channels:** ' + voiceChannels.size)
      .addFields(
        { name: '📝 Reason', value: reason, inline: true },
        { name: '👮 By', value: interaction.user.tag, inline: true }
      )
      .setColor(0xff0000);

    await interaction.reply({ embeds: [embed] });
  }
};