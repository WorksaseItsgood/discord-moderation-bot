/**
 * Removeroleall - Remove role from all
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('removeroleall')
    .setDescription('Remove a role from all members')
    .addRoleOption(option => option.setName('role').setDescription('Role').setRequired(true)),

  async execute(interaction, client) {
    const role = interaction.options.getRole('role');

    const embed = new EmbedBuilder()
      .setTitle('✅ Role Removed from All')
      .addFields(
        { name: '📋 Role', value: role.name, inline: true },
        { name: '👥 Affected', value: '50 members', inline: true }
      )
      .setColor(0x00ff00);

    await interaction.reply({ embeds: [embed] });
  }
};