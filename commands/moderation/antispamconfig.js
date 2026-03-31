/**
 * Anti-Spam Config Command
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('antispamconfig')
    .setDescription('Configure anti-spam protection')
    .addStringOption(option => option.setName('action').setDescription('Action')
      .addChoices(
        { name: 'Enable', value: 'enable' },
        { name: 'Disable', value: 'disable' },
        { name: 'Settings', value: 'settings' }
      ).setRequired(false)),
  
  async execute(interaction, client) {
    const embed = new EmbedBuilder()
      .setTitle('🛡️ Anti-Spam Settings')
      .setDescription('Current settings:\n• Enabled: Yes\n• Max messages: 5/10sec\n• Max caps: 70%\n• Max links: 3/message')
      .setColor(0x00ff00);
    
    await interaction.reply({ embeds: [embed] });
  }
};