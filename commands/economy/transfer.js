const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

// Transfer - send money to another user
module.exports = {
  data: new SlashCommandBuilder()
    .setName('transfer')
    .setDescription('Transfer money to another user')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('User to transfer to')
        .setRequired(true))
    .addIntegerOption(option =>
      option.setName('amount')
        .setDescription('Amount to transfer')
        .setMinValue(1)
        .setRequired(true)),
  async execute(interaction, client) {
    const userId = interaction.user.id;
    const targetUser = interaction.options.getUser('user');
    const amount = interaction.options.getInteger('amount');
    
    if (targetUser.id === userId) {
      return interaction.reply({ content: '❌ You cannot transfer to yourself!', ephemeral: true });
    }
    
    if (!client.economy) client.economy = new Map();
    const userData = client.economy.get(userId) || { wallet: 500, bank: 0 };
    const targetData = client.economy.get(targetUser.id) || { wallet: 500, bank: 0 };
    
    if (amount <= 0 || amount > userData.wallet) {
      return interaction.reply({ 
        content: `❌ Invalid amount! You have 💰 ${userData.wallet}.`,
        ephemeral: true 
      });
    }
    
    userData.wallet -= amount;
    targetData.wallet += amount;
    client.economy.set(userId, userData);
    client.economy.set(targetUser.id, targetData);
    
    const embed = new EmbedBuilder()
      .setTitle('💸 Transfer Complete')
      .setColor(0x00ff00)
      .addFields(
        { name: 'Sent to', value: `${targetUser}`, inline: true },
        { name: 'Amount', value: `💰 ${amount}`, inline: true },
        { name: 'Your Balance', value: `💰 ${userData.wallet}`, inline: true }
      );
    
    await interaction.reply({ embeds: [embed] });
  }
};