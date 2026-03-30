/**
 * Pay Command - Pay another user
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('pay')
    .setDescription('Pay another user some coins')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('User to pay')
        .setRequired(true)
    )
    .addIntegerOption(option =>
      option.setName('amount')
        .setDescription('Amount to pay')
        .setRequired(true)
    ),
  
  async execute(interaction, client) {
    const userId = interaction.user.id;
    const guildId = interaction.guildId;
    const target = interaction.options.getUser('user');
    const amount = interaction.options.getInteger('amount');
    
    // Can't pay yourself
    if (target.id === userId) {
      return interaction.reply({ content: "You can't pay yourself!", ephemeral: true });
    }
    
    // Validation
    if (amount <= 0) {
      return interaction.reply({ content: 'Amount must be positive!', ephemeral: true });
    }
    
    // Get user data
    const userData = client.dbManager.getOrCreateUser(userId, guildId);
    
    if (amount > userData.balance) {
      return interaction.reply({ content: `You only have ${userData.balance} coins!`, ephemeral: true });
    }
    
    // Transfer coins
    client.dbManager.updateBalance(userId, guildId, -amount);
    client.dbManager.updateBalance(target.id, guildId, amount);
    
    // Get target data
    const targetData = client.dbManager.getOrCreateUser(target.id, guildId);
    
    const embed = new EmbedBuilder()
      .setTitle('💸 Payment Successful!')
      .setDescription(`You paid **${amount} coins** to ${target.username}!`)
      .addFields(
        { name: '👤 To', value: target.username, inline: true },
        { name: '💰 Amount', value: `${amount}`, inline: true },
        { name: '💳 Your Balance', value: `${userData.balance - amount}`, inline: true }
      )
      .setColor(0x00ff00);
    
    await interaction.reply({ embeds: [embed] });
  }
};