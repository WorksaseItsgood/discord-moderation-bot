/**
 * Gamble Command - Gamble your coins for a chance to win more
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('gamble')
    .setDescription('Gamble your coins for a chance to win more')
    .addIntegerOption(option =>
      option.setName('amount')
        .setDescription('Amount to gamble (or all for all-in)')
        .setRequired(true)
    ),
  
  async execute(interaction, client) {
    const userId = interaction.user.id;
    const guildId = interaction.guildId;
    const amount = interaction.options.getInteger('amount');
    
    // Get user data
    const userData = client.dbManager.getOrCreateUser(userId, guildId);
    
    // Validation
    if (amount <= 0) {
      return interaction.reply({ content: 'Amount must be positive!', ephemeral: true });
    }
    
    if (amount > userData.balance) {
      return interaction.reply({ content: `You only have ${userData.balance} coins!`, ephemeral: true });
    }
    
    // Check cooldown (30 seconds)
    const cooldownMs = 30 * 1000;
    const remaining = client.dbManager.getCooldown(userId, guildId, 'gamble');
    
    if (remaining > 0) {
      const seconds = Math.floor(remaining / 1000);
      return interaction.reply({ content: `Wait ${seconds}s before gambling again!`, ephemeral: true });
    }
    
    // Gambling odds (40% win, 60% lose)
    const winChance = 0.4;
    const won = Math.random() < winChance;
    
    if (won) {
      // Win! Multiply the bet (1.5x to 3x)
      const multiplier = 1.5 + Math.random() * 1.5;
      const winnings = Math.floor(amount * multiplier);
      
      client.dbManager.updateBalance(userId, guildId, winnings);
      client.dbManager.updateXP(userId, guildId, 50);
      
      const embed = new EmbedBuilder()
        .setTitle('🎉 YOU WON!')
        .setDescription(`You won **${winnings} coins**!`)
        .addFields(
          { name: '🎯 Bet', value: `${amount}`, inline: true },
          { name: '📈 Multiplier', value: `${multiplier.toFixed(2)}x`, inline: true },
          { name: '💰 Profit', value: `+${winnings}`, inline: true }
        )
        .setColor(0x00ff00);
      
      await interaction.reply({ embeds: [embed] });
    } else {
      // Lose!
      client.dbManager.updateBalance(userId, guildId, -amount);
      client.dbManager.updateXP(userId, guildId, 10);
      
      const embed = new EmbedBuilder()
        .setTitle('💸 YOU LOST!')
        .setDescription(`You lost **${amount} coins**!`)
        .addFields(
          { name: '🎯 Bet', value: `${amount}`, inline: true },
          { name: '💰 Lost', value: `-${amount}`, inline: true },
          { name: '📊 New Balance', value: `${userData.balance - amount}`, inline: true }
        )
        .setColor(0xff0000);
      
      await interaction.reply({ embeds: [embed] });
    }
    
    // Set cooldown
    client.dbManager.setCooldown(userId, guildId, 'gamble', cooldownMs);
  }
};