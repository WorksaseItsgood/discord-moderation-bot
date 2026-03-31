/**
 * Modlogs - View moderation logs
 */

const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('modlogs')
    .setDescription('View moderation logs')
    .addUserOption(option => option.setName('user').setDescription('Filter by user').setRequired(false))
    .addStringOption(option => option.setName('type').setDescription('Filter by type').addChoices(
      { name: 'All', value: 'all' },
      { name: 'Warns', value: 'warn' },
      { name: 'Mutes', value: 'mute' },
      { name: 'Kicks', value: 'kick' },
      { name: 'Bans', value: 'ban' }
    ).setRequired(false)),

  async execute(interaction, client) {
    const embed = new EmbedBuilder()
      .setTitle('📋 Moderation Logs')
      .setDescription('**Showing:** Last 10 actions')
      .addFields(
        { name: '1. Warn', value: '@User1 - Spam - Mod1', inline: false },
        { name: '2. Mute', value: '@User2 - 1h - Mod1', inline: false },
        { name: '3. Kick', value: '@User3 - Abuse - Mod2', inline: false },
        { name: '4. Ban', value: '@User4 - Raiding - Admin', inline: false }
      )
      .setColor(0xff6600)
      .setFooter({ text: 'Page 1/5' });

    await interaction.reply({ embeds: [embed] });
  }
};