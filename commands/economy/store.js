const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

// Store command - buy items
module.exports = {
  data: new SlashCommandBuilder()
    .setName('store')
    .setDescription('Buy items from the store')
    .addStringOption(option =>
      option.setName('item')
        .setDescription('Item to buy')
        .setRequired(false)
        .addChoices(
          { name: 'Lucky Charm (2x earnings for 1 day)', value: 'lucky_charm' },
          { name: 'Money Bag (500 bonus)', value: 'money_bag' },
          { name: 'Shield (prevent 1 robbery)', value: 'shield' },
          { name: 'XP Boost (2x XP)', value: 'xp_boost' }
        )),
  async execute(interaction, client) {
    const userId = interaction.user.id;
    const item = interaction.options.getString('item');
    
    // Initialize economy if needed
    if (!client.economy) client.economy = new Map();
    const userData = client.economy.get(userId) || {
      wallet: 500,
      bank: 0,
      lastDaily: 0,
      lastWeekly: 0,
      lastWork: 0,
      streak: 0,
      inventory: [],
      job: 'unemployed'
    };
    
    // Show store if no item specified
    if (!item) {
      return showStore(interaction, userData);
    }
    
    // Item prices
    const prices = {
      lucky_charm: 500,
      money_bag: 1000,
      shield: 750,
      xp_boost: 300
    };
    
    const itemNames = {
      lucky_charm: '🍀 Lucky Charm',
      money_bag: '💰 Money Bag',
      shield: '🛡️ Shield',
      xp_boost: '⚡ XP Boost'
    };
    
    const price = prices[item];
    
    if (userData.wallet < price) {
      return interaction.reply({ 
        content: `❌ You need 💰 ${price} to buy this! Your balance: ${userData.wallet}`,
        ephemeral: true 
      });
    }
    
    // Purchase item
    userData.wallet -= price;
    userData.inventory = userData.inventory || [];
    userData.inventory.push({ item, name: itemNames[item], timestamp: Date.now() });
    
    client.economy.set(userId, userData);
    
    const embed = new EmbedBuilder()
      .setTitle('✅ Purchase Complete!')
      .setColor(0x00ff00)
      .addFields(
        { name: 'Item', value: itemNames[item], inline: true },
        { name: 'Cost', value: `💰 ${price}`, inline: true },
        { name: 'New Balance', value: `💰 ${userData.wallet}`, inline: true }
      );
    
    await interaction.reply({ embeds: [embed] });
  }
};

function showStore(interaction, userData) {
  const embed = new EmbedBuilder()
    .setTitle('🛒 Economy Store')
    .setColor(0x0099ff)
    .setDescription(`Your Balance: 💰 ${userData.wallet}`)
    .addFields(
      { name: '🍀 Lucky Charm - 💰500', value: '2x earnings for 1 day', inline: false },
      { name: '💰 Money Bag - 💰1000', value: '+500 bonus money', inline: false },
      { name: '🛡️ Shield - 💰750', value: 'Prevent 1 robbery', inline: false },
      { name: '⚡ XP Boost - 💰300', value: '2x XP gains', inline: false }
    )
    .setFooter({ text: 'Use /store <item> to buy' });
  
  interaction.reply({ embeds: [embed] });
}