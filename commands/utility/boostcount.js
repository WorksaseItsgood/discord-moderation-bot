/**
 * Boost Count Command
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('boostcount')
    .setDescription('View boost count'),
  
  async execute(interaction, client) {
    const guild = interaction.guild;
    
    await interaction.reply({ content: `🎉 Server has ${guild.premiumSubscriptionCount || 0} boosts!` });
  }
};