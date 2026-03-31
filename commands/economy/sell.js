/**
 * Sell Command
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const db = require('../../database');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('sell')
    .setDescription('Sell an item')
    .addStringOption(option => option.setName('item').setDescription('Item name').setRequired(true)),
  
  async execute(interaction, client) {
    const item = interaction.options.getString('item');
    const user = interaction.user;
    const prices = { sword: 250, shield: 150, vip: 500, mvp: 1250 };
    const price = prices[item.toLowerCase()] || 50;
    
    await interaction.reply({ content: `💰 You sold **${item}** for ${price} coins!` });
  }
};