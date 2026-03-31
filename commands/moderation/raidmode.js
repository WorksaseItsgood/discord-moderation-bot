/**
 * Raidmode Control
 */

const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('raidmode')
    .setDescription('Toggle raid mode')
    .addStringOption(option => option.setName('action').setDescription('Action').addChoices(
      { name: 'Enable', value: 'on' },
      { name: 'Disable', value: 'off' },
      { name: 'Status', value: 'status' }
    ).setRequired(false)),

  async execute(interaction, client) {
    const action = interaction.options.getString('action') || 'status';

    const embed = new EmbedBuilder()
      .setTitle('🛡️ Raid Mode')
      .setDescription('**Status:** ' + (action === 'on' ? '🟢 ENABLED' : '🔴 Disabled'))
      .addFields(
        { name: '👮 Enabled by', value: interaction.user.tag, inline: true },
        { name: '📅 Date', value: new Date().toLocaleString(), inline: true }
      )
      .setColor(action === 'on' ? 0xff0000 : 0x00ff00);

    await interaction.reply({ embeds: [embed] });
  }
};