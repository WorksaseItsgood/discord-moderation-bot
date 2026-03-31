/**
 * Audit Log Command
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('auditlog')
    .setDescription('View audit log')
    .addIntegerOption(option => option.setName('limit').setDescription('Number of entries').setMaxValue(50).setRequired(false)),
  
  async execute(interaction, client) {
    const embed = new EmbedBuilder()
      .setTitle('📜 Audit Log')
      .setDescription('Recent actions:\n• User1: Ban - Today\n• User2: Kick - Yesterday\n• User3: Warn - 2 days ago')
      .setColor(0x00ff00);
    
    await interaction.reply({ embeds: [embed] });
  }
};