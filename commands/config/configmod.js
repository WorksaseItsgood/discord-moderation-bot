/**
 * Configmod - Configure moderation settings
 */

const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('configmod')
    .setDescription('Configure moderation settings')
    .addStringOption(option => option.setName('action').setDescription('Action').addChoices(
      { name: 'View', value: 'view' },
      { name: 'Set Mute Role', value: 'muterole' },
      { name: 'Set Log Channel', value: 'logchannel' },
      { name: 'Set AutoMod', value: 'automod' }
    ).setRequired(false)),

  async execute(interaction, client) {
    const action = interaction.options.getString('action') || 'view';

    const embed = new EmbedBuilder()
      .setTitle('🛡️ Mod Configuration')
      .setDescription('**Server:** ' + interaction.guild.name)
      .addFields(
        { name: '🔇 Mute Role', value: 'Not set', inline: true },
        { name: '📋 Log Channel', value: '#mod-logs', inline: true },
        { name: '🤖 AutoMod', value: 'Enabled', inline: true },
        { name: '🛡️ Anti-Raid', value: 'Disabled', inline: true },
        { name: '⚠️ Anti-Spam', value: 'Enabled', inline: true },
        { name: '🔗 Anti-Invite', value: 'Disabled', inline: true }
      )
      .setColor(0x00ff00);

    await interaction.reply({ embeds: [embed] });
  }
};