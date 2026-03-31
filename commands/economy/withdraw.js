const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

// Withdraw - take money from bank
module.exports = {
  data: new SlashCommandBuilder()
    .setName('withdraw')
    .setDescription('Withdraw money from your bank account')
    .addIntegerOption(option =>
      option.setName('amount')
        .setDescription('Amount to withdraw (or "all")')
        .setMinValue(1)
        .setRequired(true)),
  async execute(interaction, client) {
    const userId = interaction.user.id;
    const amount = interaction.options.getInteger('amount');
    
    if (!client.economy) client.economy = new Map();
    const userData = client.economy.get(userId) || { wallet: 500, bank: 0 };
    
    if (amount <= 0 || amount > userData.bank) {
      return interaction.reply({ 
        content: `❌ Invalid amount! You have 💰 ${userData.bank} in your bank.`,
        ephemeral: true 
      });
    }
    
    userData.bank -= amount;
    userData.wallet += amount;
    client.economy.set(userId, userData);
    
    const embed = new EmbedBuilder()
      .setTitle('💵 Withdrawal Complete')
      .setColor(0x00ff00)
      .addFields(
        { name: 'Withdrew', value: `💰 ${amount}`, inline: true },
        { name: 'Wallet', value: `💰 ${userData.wallet}`, inline: true },
        { name: 'Bank', value: `💰 ${userData.bank}`, inline: true }
      );
    
    await interaction.reply({ embeds: [embed] });
  }
};