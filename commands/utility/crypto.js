/**
 * Crypto Command - Crypto price check
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('crypto')
    .setDescription('Check crypto price')
    .addStringOption(option =>
      option.setName('coin')
        .setDescription('Cryptocurrency symbol (e.g., BTC, ETH)')
        .setRequired(true)
    ),
  
  async execute(interaction, client) {
    const coin = interaction.options.getString('coin').toUpperCase();
    
    try {
      const res = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${coin.toLowerCase()}&vs_currencies=usd`);
      const data = await res.json();
      
      const coinData = data[coin.toLowerCase()];
      
      if (!coinData) {
        return interaction.reply({ content: 'Coin not found! Use full name (e.g., bitcoin instead of BTC)', ephemeral: true });
      }
      
      const embed = new EmbedBuilder()
        .setTitle(`₿ ${coin}`)
        .addFields(
          { name: '💵 Price', value: `$${coinData.usd.toLocaleString()}` }
        )
        .setColor(0xff9900);
      
      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      await interaction.reply({ content: 'Failed to fetch crypto price!', ephemeral: true });
    }
  }
};