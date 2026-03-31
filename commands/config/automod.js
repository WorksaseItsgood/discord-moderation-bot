/**
 * Automod Configuration
 */

const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('automod')
    .setDescription('Configure automod')
    .addStringOption(option => option.setName('action').setDescription('Action').addChoices(
      { name: 'View Settings', value: 'view' },
      { name: 'Enable', value: 'enable' },
      { name: 'Disable', value: 'disable' }
    ).setRequired(false)),

  async execute(interaction, client) {
    const embed = new EmbedBuilder()
      .setTitle('🤖 AutoMod Configuration')
      .setDescription('**Status:** Enabled')
      .addFields(
        { name: '⚠️ Anti-Spam', value: '✅ Enabled\nMax: 5 msg/10sec', inline: true },
        { name: '🔗 Anti-Invite', value: '❌ Disabled', inline: true },
        { name: '🤬 Anti-Swear', value: '✅ Enabled', inline: true },
        { name: '📢 Anti-Caps', value: '✅ Enabled\nThreshold: 70%', inline: true },
        { name: '🔗 Anti-Links', value: '❌ Disabled', inline: true },
        { name: '📎 Anti-Attachments', value: '❌ Disabled', inline: true }
      )
      .setColor(0x00ff00);

    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder().setCustomId('automod_spam').setLabel('⚠️ Anti-Spam').setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId('automod_invite').setLabel('🔗 Anti-Invite').setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId('automod_swear').setLabel('🤬 Anti-Swear').setStyle(ButtonStyle.Primary)
      );

    await interaction.reply({ embeds: [embed], components: [row] });
  }
};