/**
 * AFK Command
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('afk')
    .setDescription('Set yourself as AFK')
    .addStringOption(option => option.setName('reason').setDescription('Reason').setRequired(false)),
  
  async execute(interaction, client) {
    const reason = interaction.options.getString('reason') || 'AFK';
    
    await interaction.reply({ content: `💤 You're now AFK: ${reason}` });
  }
};