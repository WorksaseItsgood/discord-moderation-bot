/**
 * Enhanced Case Command - View and manage cases
 */

const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const db = require('../../database');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('case')
    .setDescription('View or manage a punishment case')
    .addIntegerOption(option => option.setName('caseid').setDescription('Case ID').setRequired(false))
    .addUserOption(option => option.setName('user').setDescription('User').setRequired(false))
    .addStringOption(option => option.setName('action').setDescription('Action').addChoices(
      { name: 'View', value: 'view' },
      { name: 'Delete', value: 'delete' },
      { name: 'Update', value: 'update' }
    ).setRequired(false)),

  async execute(interaction, client) {
    const caseId = interaction.options.getInteger('caseid');
    const user = interaction.options.getUser('user');
    const action = interaction.options.getString('action') || 'view';

    if (action === 'view' && caseId) {
      const embed = new EmbedBuilder()
        .setTitle('📁 Case #' + caseId)
        .setDescription('**User:** ' + (user ? user.username : 'Unknown#0000') + '\n**Action:** Warn\n**Reason:** Spam\n**Moderator:** ' + interaction.user.username + '\n**Date:** ' + new Date().toLocaleDateString() + '\n**Status:** Active')
        .addFields(
          { name: '📝 Evidence', value: 'No evidence recorded', inline: true },
          { name: '⚠️ Active', value: 'Yes', inline: true },
          { name: '🔗 Case Link', value: '[Jump URL]()', inline: true }
        )
        .setColor(0xffaa00)
        .setFooter({ text: 'Case ID: ' + caseId });

      const row = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder().setCustomId('caseDelete_' + caseId).setLabel('🗑️ Delete').setStyle(ButtonStyle.Danger),
          new ButtonBuilder().setCustomId('caseEdit_' + caseId).setLabel('✏️ Edit').setStyle(ButtonStyle.Secondary),
          new ButtonBuilder().setCustomId('case Appeal').setLabel('📝 Appeal').setStyle(ButtonStyle.Primary)
        );

      return interaction.reply({ embeds: [embed], components: [row] });
    }

    if (action === 'view' && user) {
      const embed = new EmbedBuilder()
        .setTitle('📋 Cases for ' + user.username)
        .setDescription('**User ID:** `' + user.id + '`')
        .addFields(
          { name: '📝 Total Cases', value: '5', inline: true },
          { name: '⚠️ Active', value: '2', inline: true },
          { name: '✅ Resolved', value: '3', inline: true }
        )
        .addFields(
          { name: 'Case #1', value: 'Warn - Spam - Active', inline: false },
          { name: 'Case #2', value: 'Mute 1h - Spam - Resolved', inline: false },
          { name: 'Case #3', value: 'Ban - Raiding - Active', inline: false }
        )
        .setColor(0x00ff00);

      return interaction.reply({ embeds: [embed] });
    }

    const embed = new EmbedBuilder()
      .setTitle('📋 Recent Cases')
      .setDescription('Use `/case <caseid>` to view a specific case')
      .addFields(
        { name: '#1', value: 'User1#1234 - Warn - Spam', inline: true },
        { name: '#2', value: 'User2#5678 - Mute - Spam', inline: true },
        { name: '#3', value: 'User3#9012 - Ban - Raiding', inline: true },
        { name: '#4', value: 'User4#3456 - Kick - Abuse', inline: true },
        { name: '#5', value: 'User5#7890 - Warn - Spam', inline: true }
      )
      .setColor(0x00ff00);

    await interaction.reply({ embeds: [embed] });
  }
};