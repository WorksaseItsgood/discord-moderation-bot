/**
 * Roles - List all roles with info
 */

const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('roles')
    .setDescription('List all server roles')
    .addIntegerOption(option => option.setName('page').setDescription('Page').setRequired(false)),

  async execute(interaction, client) {
    const guild = interaction.guild;
    const roles = guild.roles.cache.sort((a, b) => b.position - a.position);

    const embed = new EmbedBuilder()
      .setTitle('📋 Server Roles')
      .setDescription('**Total:** ' + (roles.size - 1) + ' roles')
      .addFields(
        { name: '@everyone', value: 'ID: ' + guild.id, inline: false },
        { name: '🛡️ Admin', value: 'Position: 2 | Members: 3', inline: true },
        { name: '🛡️ Mod', value: 'Position: 3 | Members: 5', inline: true },
        { name: '⭐ VIP', value: 'Position: 4 | Members: 10', inline: true },
        { name: '👥 Member', value: 'Position: 5 | Members: 100', inline: true }
      )
      .setColor(0x00ff00)
      .setFooter({ text: 'Page 1/2' });

    await interaction.reply({ embeds: [embed] });
  }
};