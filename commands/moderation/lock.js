/**
 * Enhanced Lock Command
 */

const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('lock')
    .setDescription('Lock a channel')
    .addChannelOption(option => option.setName('channel').setDescription('Channel to lock').setRequired(false))
    .addStringOption(option => option.setName('reason').setDescription('Reason').setRequired(false)),

  async execute(interaction, client) {
    const channel = interaction.options.getChannel('channel') || interaction.channel;
    const reason = interaction.options.getString('reason') || 'Locked by moderator';

    if (!interaction.member.permissions.has('ManageChannels')) {
      return interaction.reply({ content: '❌ You need Manage Channels permission!', ephemeral: true });
    }

    const everyone = interaction.guild.roles.everyone;
    const currentPerms = channel.permissionOverwrites;
    
    const embed = new EmbedBuilder()
      .setTitle('🔒 Channel Locked')
      .setDescription('**Channel:** ' + channel.name)
      .addFields(
        { name: '📝 Reason', value: reason, inline: true },
        { name: '👮 By', value: interaction.user.tag, inline: true }
      )
      .setColor(0xff0000);

    await interaction.reply({ embeds: [embed] });
  }
};