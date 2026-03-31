/**
 * Anti-Raid Config Command
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('antiraid')
    .setDescription('Configure anti-raid protection')
    .addStringOption(option => option.setName('action').setDescription('Action')
      .addChoices(
        { name: 'Enable', value: 'enable' },
        { name: 'Disable', value: 'disable' },
        { name: 'Settings', value: 'settings' }
      ).setRequired(false)),
  
  async execute(interaction, client) {
    const embed = new EmbedBuilder()
      .setTitle('🛡️ Anti-Raid Settings')
      .setDescription('Current settings:\n• Enabled: Yes\n• Join threshold: 5/min\n• Ban threshold: 10/min')
      .setColor(0x00ff00);
    
    await interaction.reply({ embeds: [embed] });
  }
};