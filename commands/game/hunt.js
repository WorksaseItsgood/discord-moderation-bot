const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

// Hunt command - Hunting minigame
module.exports = {
  data: new SlashCommandBuilder()
    .setName('hunt')
    .setDescription('Go hunting!'),
  async execute(interaction, client) {
    const preyTypes = [
      { name: '🐰 Rabbit', value: 10, rarity: 35 },
      { name: '🦌 Deer', value: 25, rarity: 25 },
      { name: '🦌 Elk', value: 40, rarity: 15 },
      { name: '🐺 Wolf', value: 30, rarity: 10 },
      { name: '🐻 Bear', value: 75, rarity: 8 },
      { name: '🦬 Bison', value: 60, rarity: 5 },
      { name: '🦅 Eagle', value: 50, rarity: 2 }
    ];
    
    const roll = Math.random() * 100;
    let cumulative = 0;
    let caught = null;
    
    for (const prey of preyTypes) {
      cumulative += prey.rarity;
      if (roll <= cumulative) {
        caught = prey;
        break;
      }
    }
    
    caught = caught || preyTypes[0];
    
    // Update economy balance
    const userId = interaction.user.id;
    if (!client.economy) client.economy = new Map();
    const userBalances = client.economy;
    const currentBalance = userBalances.get(userId) || 0;
    userBalances.set(userId, currentBalance + caught.value);
    
    const embed = new EmbedBuilder()
      .setTitle('🏹 Hunting Trip!')
      .setColor(0x228b22)
      .setDescription(`You caught: **${caught.name}**!\n💰 Value: ${caught.value} coins`)
      .setFooter({ text: `New Balance: ${currentBalance + caught.value} coins` });
    
    await interaction.reply({ embeds: [embed] });
  }
};