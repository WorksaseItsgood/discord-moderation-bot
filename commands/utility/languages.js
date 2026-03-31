/**
 * Languages Command
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('languages')
    .setDescription('List available languages for translation'),
  
  async execute(interaction, client) {
    const embed = new EmbedBuilder()
      .setTitle('🌐 Available Languages')
      .setDescription('• English (en)\n• Spanish (es)\n• French (fr)\n• German (de)\n• Italian (it)\n• Portuguese (pt)\n• Chinese (zh)\n• Japanese (ja)\n• Korean (ko)\n• Russian (ru)')
      .setColor(0x00ff00);
    
    await interaction.reply({ embeds: [embed] });
  }
};