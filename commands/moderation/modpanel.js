/**
 * Modpanel - Interactive moderation panel
 */

const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('modpanel')
    .setDescription('Open moderation panel'),

  async execute(interaction, client) {
    const embed = new EmbedBuilder()
      .setTitle('🛡️ Moderation Panel')
      .setDescription('Quick moderation actions')
      .addFields(
        { name: '⚠️ Actions', value: 'Select an action below', inline: false }
      )
      .setColor(0xff6600)
      .setFooter({ text: 'Clawdbot Moderation' });

    const row1 = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder().setCustomId('mod_warn').setLabel('⚠️ Warn').setStyle(ButtonStyle.Danger),
        new ButtonBuilder().setCustomId('mod_mute').setLabel('🔇 Mute').setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId('mod_kick').setLabel('👢 Kick').setStyle(ButtonStyle.Danger),
        new ButtonBuilder().setCustomId('mod_ban').setLabel('🚫 Ban').setStyle(ButtonStyle.Danger)
      );

    const row2 = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder().setCustomId('mod_lock').setLabel('🔒 Lock').setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId('mod_slowmode').setLabel('🐢 Slowmode').setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId('mod_purge').setLabel('🗑️ Purge').setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId('mod_logs').setLabel('📋 Logs').setStyle(ButtonStyle.Primary)
      );

    await interaction.reply({ embeds: [embed], components: [row1, row2] });
  }
};