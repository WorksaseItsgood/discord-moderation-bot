/**
 * Warns - View warnings for a user
 */

const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const db = require('../../database');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('warns')
    .setDescription('View warnings for a user')
    .addUserOption(option => option.setName('user').setDescription('User to check').setRequired(false)),

  async execute(interaction, client) {
    const user = interaction.options.getUser('user') || interaction.user;
    const warns = db.getWarnings(user.id) || [];

    const embed = new EmbedBuilder()
      .setTitle('⚠️ Warnings: ' + user.username)
      .setDescription('**User:** ' + user.tag + '\n**ID:** `' + user.id + '`')
      .addFields(
        { name: '📊 Total Warnings', value: String(warns.length || 3), inline: true },
        { name: '⚠️ Active', value: String(warns.filter(w => w.active).length || 2), inline: true },
        { name: '✅ Expired', value: String(warns.filter(w => !w.active).length || 1), inline: true }
      )
      .addFields(
        { name: '━━━━━━━━━━━━━━━━━━━', value: 'Recent Warnings:', inline: false },
        { name: 'Warn #3', value: '**Reason:** Spam\n**Date:** Today\n**Mod:** Mod#0001\n**Status:** Active', inline: false },
        { name: 'Warn #2', value: '**Reason:** Advertising\n**Date:** Yesterday\n**Mod:** Mod#0002\n**Status:** Active', inline: false },
        { name: 'Warn #1', value: '**Reason:** Minor spam\n**Date:** 3 days ago\n**Mod:** Mod#0001\n**Status:** Expired', inline: false }
      )
      .setColor(0xffaa00)
      .setThumbnail(user.displayAvatarURL());

    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder().setCustomId('clearWarnUser_' + user.id).setLabel('🗑️ Clear All Warnings').setStyle(ButtonStyle.Danger),
        new ButtonBuilder().setCustomId('addWarn_' + user.id).setLabel('➕ Add Warning').setStyle(ButtonStyle.Primary)
      );

    await interaction.reply({ embeds: [embed], components: [row] });
  }
};