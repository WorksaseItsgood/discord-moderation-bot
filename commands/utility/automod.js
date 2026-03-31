const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

// Sitemap command - Disable/enable auto-mod per channel
module.exports = {
  data: new SlashCommandBuilder()
    .setName('automod')
    .setDescription('Configure automod for a channel')
    .addChannelOption(option =>
      option.setName('channel')
        .setDescription('Channel to configure')
        .setRequired(false))
    .addBooleanOption(option =>
      option.setName('enabled')
        .setDescription('Enable or disable automod')
        .setRequired(true)),
  permissions: [PermissionFlagsBits.ManageChannels],
  async execute(interaction, client) {
    const channel = interaction.options.getChannel('channel') || interaction.channel;
    const enabled = interaction.options.getBoolean('enabled');
    
    if (!client.automodConfig) client.automodConfig = new Map();
    
    const channelConfigs = client.automodConfig.get(interaction.guild.id) || {};
    channelConfigs[channel.id] = { enabled: enabled };
    client.automodConfig.set(interaction.guild.id, channelConfigs);
    
    const embed = new EmbedBuilder()
      .setTitle('AutoMod Config')
      .setColor(enabled ? 0x2ecc71 : 0xe74c3c)
      .setDescription(channel.toString() + ' automod is now **' + (enabled ? 'enabled' : 'disabled') + '**');
    
    await interaction.reply({ embeds: [embed] });
  }
};