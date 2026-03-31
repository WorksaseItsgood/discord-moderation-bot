/**
 * Lockdown - Server lockdown
 */

const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('lockdown')
    .setDescription('Lockdown the server')
    .addStringOption(option => option.setName('reason').setDescription('Reason').setRequired(false)),

  async execute(interaction, client) {
    const reason = interaction.options.getString('reason') || 'Server lockdown';

    if (!interaction.member.permissions.has('Administrator')) {
      return interaction.reply({ content: '❌ Admin only!', ephemeral: true });
    }

    const embed = new EmbedBuilder()
      .setTitle('🔒 Server Lockdown')
      .setDescription('**All channels locked**')
      .addFields(
        { name: '📝 Reason', value: reason, inline: true },
        { name: '👮 By', value: interaction.user.tag, inline: true }
      )
      .setColor(0xff0000);

    await interaction.reply({ embeds: [embed] });
  }
};