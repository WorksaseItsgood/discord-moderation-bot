/**
 * Shop Command
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('shop')
    .setDescription('View the item shop'),
  
  async execute(interaction, client) {
    const embed = new EmbedBuilder()
      .setTitle('🛒 Item Shop')
      .setDescription('Available items:')
      .addFields(
        { name: '🗡️ Weapons', value: 'Sword - 500\nShield - 300', inline: true },
        { name: '🎭 Badges', value: 'Bronze - 100\nSilver - 250\nGold - 500', inline: true },
        { name: '💎 Premium', value: 'VIP - 1000\nMVP - 2500', inline: true }
      )
      .setColor(0xffd700);
    
    await interaction.reply({ embeds: [embed] });
  }
};