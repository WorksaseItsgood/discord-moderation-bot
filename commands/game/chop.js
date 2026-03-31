const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

// Chop command - Chop wood minigame
module.exports = {
  data: new SlashCommandBuilder()
    .setName('chop')
    .setDescription('Go chop wood!'),
  async execute(interaction, client) {
    const woodTypes = [
      { name: '🪵 Stick', value: 3, rarity: 40 },
      { name: '🪵 Pine Log', value: 8, rarity: 30 },
      { name: '🪵 Oak Log', value: 15, rarity: 20 },
      { name: '🪵 Maple Log', value: 25, rarity: 7 },
      { name: '🌲 Pine Cone', value: 20, rarity: 2 },
      { name: '🎋 Bamboo', value: 30, rarity: 1 }
    ];
    
    const roll = Math.random() * 100;
    let cumulative = 0;
    let caught = null;
    
    for (const wood of woodTypes) {
      cumulative += wood.rarity;
      if (roll <= cumulative) {
        caught = wood;
        break;
      }
    }
    
    caught = caught || woodTypes[0];
    
    // Update economy balance
    const userId = interaction.user.id;
    if (!client.economy) client.economy = new Map();
    const userBalances = client.economy;
    const currentBalance = userBalances.get(userId) || 0;
    userBalances.set(userId, currentBalance + caught.value);
    
    const embed = new EmbedBuilder()
      .setTitle('🪓 Wood Chopping!')
      .setColor(0x8b4513)
      .setDescription(`You got: **${caught.name}**!\n💰 Value: ${caught.value} coins`)
      .setFooter({ text: `New Balance: ${currentBalance + caught.value} coins` });
    
    await interaction.reply({ embeds: [embed] });
  }
};