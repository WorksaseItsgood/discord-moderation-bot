/**
 * Mod Log Command
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('modlog')
    .setDescription('View moderation log')
    .addIntegerOption(option => option.setName('limit').setDescription('Number of entries').setMaxValue(50).setRequired(false)),
  
  async execute(interaction, client) {
    const embed = new EmbedBuilder()
      .setTitle('📋 Mod Log')
      .setDescription('Recent moderation:\n• User1: Warn - Spam\n• User2: Mute - 1hr\n• User3: Ban - Raiding')
      .setColor(0xff0000);
    
    await interaction.reply({ embeds: [embed] });
  }
};