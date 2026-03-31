const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

// Mine command - Mining minigame
module.exports = {
  data: new SlashCommandBuilder()
    .setName('mine')
    .setDescription('Go mining!'),
  async execute(interaction, client) {
    const resources = [
      { name: '🪨 Stone', value: 5, rarity: 35 },
      { name: '�ite Iron Ore', value: 15, rarity: 30 },
      { name: '🟡 Gold Ore', value: 35, rarity: 20 },
      { name: '💎 Diamond', value: 75, rarity: 10 },
      { name: '🟢 Emerald', value: 100, rarity: 3 },
      { name: '🔴 Ruby', value: 150, rarity: 2 }
    ];
    
    const roll = Math.random() * 100;
    let cumulative = 0;
    let caught = null;
    
    for (const resource of resources) {
      cumulative += resource.rarity;
      if (roll <= cumulative) {
        caught = resource;
        break;
      }
    }
    
    caught = caught || resources[0];
    
    // Fix emoji
    let name = caught.name;
    if (name.includes('ite')) name = name.replace('ite', '');
    
    // Update economy balance
    const userId = interaction.user.id;
    if (!client.economy) client.economy = new Map();
    const userBalances = client.economy;
    const currentBalance = userBalances.get(userId) || 0;
    userBalances.set(userId, currentBalance + caught.value);
    
    const embed = new EmbedBuilder()
      .setTitle('⛏️ Mining Trip!')
      .setColor(0x696969)
      .setDescription(`You found: **${name || caught.name}**!\n💰 Value: ${caught.value} coins`)
      .setFooter({ text: `New Balance: ${currentBalance + caught.value} coins` });
    
    await interaction.reply({ embeds: [embed] });
  }
};