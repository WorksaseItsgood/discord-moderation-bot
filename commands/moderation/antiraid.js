/**
 * Antiraid Configuration
 */

const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('antiraid')
    .setDescription('Configure anti-raid protection')
    .addStringOption(option => option.setName('action').setDescription('Action').addChoices(
      { name: 'View Status', value: 'view' },
      { name: 'Enable', value: 'enable' },
      { name: 'Disable', value: 'disable' },
      { name: 'Configure', value: 'config' }
    ).setRequired(false)),

  async execute(interaction, client) {
    const embed = new EmbedBuilder()
      .setTitle('🛡️ Anti-Raid Configuration')
      .setDescription('**Status:** Disabled')
      .addFields(
        { name: '⏱️ Join Threshold', value: '10 joins/min', inline: true },
        { name: '🚫 Ban Threshold', value: '20 joins/min', inline: true },
        { name: '⏲️ Cooldown', value: '30 minutes', inline: true },
        { name: '🛡️ Account Age', value: 'Not set', inline: true },
        { name: '⚡ Action', value: 'Ban', inline: true }
      )
      .setColor(0x00ff00);

    await interaction.reply({ embeds: [embed] });
  }
};