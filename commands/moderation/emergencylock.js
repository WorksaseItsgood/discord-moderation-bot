/**
 * Emergency Lockdown
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('emergencylock')
    .setDescription('Emergency server lockdown'),

  async execute(interaction, client) {
    const embed = new EmbedBuilder()
      .setTitle('⚠️ EMERGENCY LOCKDOWN')
      .setDescription('**🔒 SERVER LOCKED**\n\nAll members locked out except admins.')
      .setColor(0xff0000);

    await interaction.reply({ embeds: [embed] });
  }
};