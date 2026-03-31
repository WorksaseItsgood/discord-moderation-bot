/**
 * Adminpanel - Interactive admin panel
 */

const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('adminpanel')
    .setDescription('Open admin panel'),

  async execute(interaction, client) {
    if (!interaction.member.permissions.has('Administrator')) {
      return interaction.reply({ content: '❌ Admin only!', ephemeral: true });
    }

    const embed = new EmbedBuilder()
      .setTitle('⚙️ Admin Panel')
      .setDescription('Server management')
      .addFields(
        { name: '⚡ Server', value: interaction.guild.name, inline: true },
        { name: '👥 Members', value: interaction.guild.memberCount, inline: true }
      )
      .setColor(0xff0000);

    const row1 = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder().setCustomId('admin_settings').setLabel('⚙️ Settings').setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId('admin_roles').setLabel('🛡️ Roles').setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId('admin_channels').setLabel('📁 Channels').setStyle(ButtonStyle.Primary)
      );

    const row2 = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder().setCustomId('admin_backup').setLabel('💾 Backup').setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId('admin_automod').setLabel('🤖 Automod').setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId('admin_whitelist').setLabel('✅ Whitelist').setStyle(ButtonStyle.Secondary)
      );

    await interaction.reply({ embeds: [embed], components: [row1, row2] });
  }
};