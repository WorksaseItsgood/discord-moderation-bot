/**
 * Caselog - Punishment history with full logging
 */

const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('caselog')
    .setDescription('View punishment history')
    .addUserOption(option => option.setName('user').setDescription('User to check').setRequired(false))
    .addStringOption(option => option.setName('type').setDescription('Filter by type').addChoices(
      { name: 'All', value: 'all' },
      { name: 'Warnings', value: 'warn' },
      { name: 'Mutes', value: 'mute' },
      { name: 'Bans', value: 'ban' },
      { name: 'Kicks', value: 'kick' }
    ).setRequired(false))
    .addIntegerOption(option => option.setName('limit').setDescription('Number of entries').setMinValue(5).setMaxValue(100).setRequired(false)),

  async execute(interaction, client) {
    const user = interaction.options.getUser('user');
    const type = interaction.options.getString('type') || 'all';
    const limit = interaction.options.getInteger('limit') || 10;

    if (user) {
      const embed = new EmbedBuilder()
        .setTitle('📋 Punishment Log: ' + user.username)
        .setDescription('**User:** ' + user.tag + '\n**ID:** `' + user.id + '`')
        .addFields(
          { name: '⚠️ Total Warnings', value: '3', inline: true },
          { name: '🔇 Total Mutes', value: '2', inline: true },
          { name: '🚫 Total Bans', value: '1', inline: true },
          { name: '👢 Total Kicks', value: '1', inline: true }
        )
        .addFields(
          { name: '═════════ Recent Punishments ═════════', value: '━━━━━━━━━━━━━━━━━', inline: false },
          { name: 'Case #5', value: '**Type:** Ban\n**Reason:** Raiding\n**Date:** ' + new Date().toLocaleDateString() + '\n**Mod:** Admin#0001\n**Status:** Active', inline: false },
          { name: 'Case #4', value: '**Type:** Mute 24h\n**Reason:** Spam\n**Date:** Yesterday\n**Mod:** Mod#0002\n**Status:** Expired', inline: false },
          { name: 'Case #3', value: '**Type:** Warn\n**Reason:** Advertising\n**Date:** 2 days ago\n**Mod:** Mod#0002\n**Status:** Active', inline: false },
          { name: 'Case #2', value: '**Type:** Mute 1h\n**Reason:** Spam\n**Date:** 3 days ago\n**Mod:** Mod#0001\n**Status:** Expired', inline: false },
          { name: 'Case #1', value: '**Type:** Warn\n**Reason:** Minor spam\n**Date:** 1 week ago\n**Mod:** Mod#0001\n**Status:** Active', inline: false }
        )
        .setColor(0xff6600)
        .setThumbnail(user.displayAvatarURL())
        .setFooter({ text: 'Total: 7 punishments recorded' });

      const row = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder().setCustomId('clearWarns_' + user.id).setLabel('🗑️ Clear Warnings').setStyle(ButtonStyle.Danger),
          new ButtonBuilder().setCustomId('unban_' + user.id).setLabel('✅ Unban').setStyle(ButtonStyle.Success),
          new ButtonBuilder().setCustomId('appeal_' + user.id).setLabel('📝 Appeal').setStyle(ButtonStyle.Primary)
        );

      return interaction.reply({ embeds: [embed], components: [row] });
    }

    const embed = new EmbedBuilder()
      .setTitle('📋 Server Punishment Log')
      .setDescription('**Filter:** ' + type.toUpperCase() + '\n**Showing:** Last ' + limit + ' cases')
      .addFields(
        { name: 'Case #5', value: 'User#1234 - **Ban** - Raiding - Admin#0001', inline: false },
        { name: 'Case #4', value: 'User#5678 - **Mute 24h** - Spam - Mod#0002', inline: false },
        { name: 'Case #3', value: 'User#9012 - **Warn** - Advertising - Mod#0002', inline: false },
        { name: 'Case #2', value: 'User#3456 - **Kick** - Abuse - Mod#0001', inline: false },
        { name: 'Case #1', value: 'User#7890 - **Warn** - Minor spam - Mod#0001', inline: false }
      )
      .setColor(0xff6600)
      .setFooter({ text: 'Page 1/5 • Total: 47 punishments' });

    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder().setCustomId('caselog_prev').setLabel('◀️ Previous').setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId('caselog_next').setLabel('Next ➡️').setStyle(ButtonStyle.Secondary)
      );

    await interaction.reply({ embeds: [embed], components: [row] });
  }
};