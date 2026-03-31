/**
 * Raidstatus - Check raid mode status
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('raidstatus')
    .setDescription('Check raid mode status'),

  async execute(interaction, client) {
    const embed = new EmbedBuilder()
      .setTitle('🛡️ Raid Mode Status')
      .setDescription('**Status:** 🔴 Disabled\n\nNo active raid detected.')
      .setColor(0x00ff00);

    await interaction.reply({ embeds: [embed] });
  }
};