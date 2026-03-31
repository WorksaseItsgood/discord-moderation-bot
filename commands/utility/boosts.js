/**
 * Boosts Command - Server boost count
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('boosts')
    .setDescription('View server boosts'),
  
  async execute(interaction, client) {
    const guild = interaction.guild;
    
    const embed = new EmbedBuilder()
      .setTitle('🚀 Server Boosts')
      .setDescription(`Server has ${guild.premiumSubscriptionCount || 0} booster(s)\nTier: ${guild.premiumTier || 0}`)
      .setColor(0xff00ff);
    
    await interaction.reply({ embeds: [embed] });
  }
};