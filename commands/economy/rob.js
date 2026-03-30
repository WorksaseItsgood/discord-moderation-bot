/**
 * Rob Command - Rob another user
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('rob')
    .setDescription('Rob another user')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('User to rob')
        .setRequired(true)
    ),
  
  async execute(interaction, client) {
    const userId = interaction.user.id;
    const guildId = interaction.guildId;
    const target = interaction.options.getUser('user');
    
    // Can't rob yourself
    if (target.id === userId) {
      return interaction.reply({ content: "You can't rob yourself!", ephemeral: true });
    }
    
    // Can't rob bots
    if (target.bot) {
      return interaction.reply({ content: "You can't rob bots!", ephemeral: true });
    }
    
    // Check cooldown (5 minutes)
    const cooldownMs = 5 * 60 * 1000;
    const remaining = client.dbManager.getCooldown(userId, guildId, 'rob');
    
    if (remaining > 0) {
      const minutes = Math.floor(remaining / (1000 * 60));
      return interaction.reply({ content: `Wait ${minutes}m before robbing again!`, ephemeral: true });
    }
    
    // Get user data
    const userData = client.dbManager.getOrCreateUser(userId, guildId);
    const targetData = client.dbManager.getOrCreateUser(target.id, guildId);
    
    // Target must have some coins
    if (targetData.balance < 100) {
      return interaction.reply({ content: `${target.username} is too poor to rob!`, ephemeral: true });
    }
    
    // Rob attempt (30% success rate)
    const success = Math.random() < 0.3;
    
    if (success) {
      // Successful rob (10-50% of their balance)
      const robPercent = 0.1 + Math.random() * 0.4;
      const stolenAmount = Math.max(Math.floor(targetData.balance * robPercent), 10);
      
      // Update balances
      client.dbManager.updateBalance(userId, guildId, stolenAmount);
      client.dbManager.updateBalance(target.id, guildId, -stolenAmount);
      client.dbManager.updateXP(userId, guildId, 100);
      
      const embed = new EmbedBuilder()
        .setTitle('💰 ROBBERY SUCCESS!')
        .setDescription(`You robbed **${stolenAmount} coins** from ${target.username}!`)
        .addFields(
          { name: '👤 Victim', value: target.username, inline: true },
          { name: '💵 Stolen', value: `+${stolenAmount}`, inline: true },
          { name: '⭐ XP Earned', value: '+100', inline: true }
        )
        .setColor(0x00ff00);
      
      await interaction.reply({ embeds: [embed] });
    } else {
      // Failed rob - get caught and lose some coins
      const fine = Math.floor(userData.balance * 0.1);
      client.dbManager.updateBalance(userId, guildId, -fine);
      client.dbManager.updateXP(userId, guildId, 20);
      
      const embed = new EmbedBuilder()
        .setTitle('🚨 ROBBERY FAILED!')
        .setDescription(`You got caught and fined **${fine} coins**!`)
        .addFields(
          { name: '👤 Tried to rob', value: target.username, inline: true },
          { name: '💸 Fine', value: `-${fine}`, inline: true },
          { name: '📊 New Balance', value: `${userData.balance - fine}`, inline: true }
        )
        .setColor(0xff0000);
      
      await interaction.reply({ embeds: [embed] });
    }
    
    // Set cooldown
    client.dbManager.setCooldown(userId, guildId, 'rob', cooldownMs);
  }
};