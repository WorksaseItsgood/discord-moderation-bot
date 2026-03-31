/**
 * Mod Panel Command
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('modpanel')
    .setDescription('Open the moderation panel'),
  
  async execute(interaction, client) {
    const embed = new EmbedBuilder()
      .setTitle('🛡️ Mod Panel')
      .setDescription('Moderation Actions:\n• Purge Messages\n• Warn User\n• Mute User\n• Ban User\n• Kick User')
      .setColor(0xff6600);
    
    await interaction.reply({ embeds: [embed] });
  }
};