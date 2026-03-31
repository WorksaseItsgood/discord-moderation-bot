const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

// Inventory - view your items
module.exports = {
  data: new SlashCommandBuilder()
    .setName('inventory')
    .setDescription('View your inventory'),
  async execute(interaction, client) {
    const userId = interaction.user.id;
    
    if (!client.economy) client.economy = new Map();
    const userData = client.economy.get(userId) || {
      wallet: 500,
      bank: 0,
      inventory: []
    };
    
    const inventory = userData.inventory || [];
    
    if (inventory.length === 0) {
      return interaction.reply({ 
        content: '🎒 Your inventory is empty! Use /store to buy items.',
        ephemeral: true 
      });
    }
    
    const embed = new EmbedBuilder()
      .setTitle('🎒 Your Inventory')
      .setColor(0x0099ff)
      .setDescription(`Total items: ${inventory.length}`);
    
    for (const item of inventory) {
      embed.addFields({
        name: item.name,
        value: `Acquired: <t:${Math.floor(item.timestamp / 1000)}:d>`
      });
    }
    
    await interaction.reply({ embeds: [embed] });
  }
};