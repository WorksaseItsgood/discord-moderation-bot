/**
 * Setmuterole - Set mute role
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setmuterole')
    .setDescription('Set the mute role')
    .addRoleOption(option => option.setName('role').setDescription('Mute role').setRequired(true)),

  async execute(interaction, client) {
    const role = interaction.options.getRole('role');

    const embed = new EmbedBuilder()
      .setTitle('✅ Mute Role Set')
      .setDescription('**Role:** ' + role.name)
      .setColor(0x00ff00);

    await interaction.reply({ embeds: [embed] });
  }
};