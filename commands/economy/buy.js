/**
 * Buy Command
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const db = require('../../database');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('buy')
    .setDescription('Buy an item')
    .addStringOption(option => option.setName('item').setDescription('Item name').setRequired(true))
    .addIntegerOption(option => option.setName('amount').setDescription('Quantity').setRequired(false)),
  
  async execute(interaction, client) {
    const item = interaction.options.getString('item');
    const user = interaction.user;
    const prices = { sword: 500, shield: 300, vip: 1000, mvp: 2500 };
    const price = prices[item.toLowerCase()] || 100;
    
    if (db.getBalance(user.id) < price) {
      return interaction.reply({ content: '❌ Not enough coins!', ephemeral: true });
    }
    
    db.removeBalance(user.id, price);
    db.addInventory(user.id, item);
    
    await interaction.reply({ content: `🛒 You bought **${item}** for ${price} coins!` });
  }
};