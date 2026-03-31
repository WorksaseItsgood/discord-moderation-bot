const { SlashCommandBuilder, EmbedBuilder, AttachmentBuilder } = require('discord.js');
const fs = require('fs');

// Fish command - Fishing minigame
module.exports = {
  data: new SlashCommandBuilder()
    .setName('fish')
    .setDescription('Go fishing!'),
  async execute(interaction, client) {
    const fishTypes = [
      { name: '🐟 Small Fish', value: 5, rarity: 40 },
      { name: '🐠 Tropical Fish', value: 15, rarity: 25 },
      { name: '🦈 Shark', value: 50, rarity: 15 },
      { name: '🦑 Squid', value: 25, rarity: 10 },
      { name: '🐋 Whale', value: 100, rarity: 5 },
      { name: '🦞 Lobster', value: 35, rarity: 3 },
      { name: '🦀 Crab', value: 20, rarity: 2 }
    ];
    
    const roll = Math.random() * 100;
    let cumulative = 0;
    let caught = null;
    
    for (const fish of fishTypes) {
      cumulative += fish.rarity;
      if (roll <= cumulative) {
        caught = fish;
        break;
      }
    }
    
    caught = caught || fishTypes[0];
    
    // Update economy balance
    const userId = interaction.user.id;
    if (!client.economy) client.economy = new Map();
    const userBalances = client.economy;
    const currentBalance = userBalances.get(userId) || 0;
    userBalances.set(userId, currentBalance + caught.value);
    
    const embed = new EmbedBuilder()
      .setTitle('🎣 Fishing Time!')
      .setColor(0x00bfff)
      .setDescription(`You caught: **${caught.name}**!\n💰 Value: ${caught.value} coins`)
      .setFooter({ text: `New Balance: ${currentBalance + caught.value} coins` });
    
    await interaction.reply({ embeds: [embed] });
  }
};