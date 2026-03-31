const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

// Deposit - put money in bank
module.exports = {
  data: new SlashCommandBuilder()
    .setName('deposit')
    .setDescription('Deposit money to your bank account')
    .addIntegerOption(option =>
      option.setName('amount')
        .setDescription('Amount to deposit (or "all")')
        .setMinValue(1)
        .setRequired(true)),
  async execute(interaction, client) {
    const userId = interaction.user.id;
    const amount = interaction.options.getInteger('amount');
    
    if (!client.economy) client.economy = new Map();
    const userData = client.economy.get(userId) || { wallet: 500, bank: 0 };
    
    let depositAmount = amount;
    
    if (amount <= 0 || amount > userData.wallet) {
      return interaction.reply({ 
        content: `❌ Invalid amount! You have 💰 ${userData.wallet} in your wallet.`,
        ephemeral: true 
      });
    }
    
    userData.wallet -= depositAmount;
    userData.bank += depositAmount;
    client.economy.set(userId, userData);
    
    const embed = new EmbedBuilder()
      .setTitle('💳 Deposit Complete')
      .setColor(0x00ff00)
      .addFields(
        { name: 'Deposited', value: `💰 ${depositAmount}`, inline: true },
        { name: 'Wallet', value: `💰 ${userData.wallet}`, inline: true },
        { name: 'Bank', value: `💰 ${userData.bank}`, inline: true }
      );
    
    await interaction.reply({ embeds: [embed] });
  }
};