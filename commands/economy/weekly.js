/**
 * Weekly Command - Claim weekly rewards (bigger reward)
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('weekly')
    .setDescription('Claim your weekly reward'),
  
  async execute(interaction, client) {
    const userId = interaction.user.id;
    const guildId = interaction.guildId;
    
    // Check cooldown (7 days)
    const cooldownMs = 7 * 24 * 60 * 60 * 1000;
    const remaining = client.dbManager.getCooldown(userId, guildId, 'weekly');
    
    if (remaining > 0) {
      const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
      const hours = Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      
      const embed = new EmbedBuilder()
        .setTitle('⏳ Weekly Cooldown')
        .setDescription(`You can claim your next weekly in **${days}d ${hours}h**`)
        .setColor(0xffaa00);
      
      return interaction.reply({ embeds: [embed], ephemeral: true });
    }
    
    // Get user data
    const userData = client.dbManager.getOrCreateUser(userId, guildId);
    
    // Weekly reward (bigger than daily)
    const weeklyReward = 5000;
    
    // Update balance
    client.dbManager.updateBalance(userId, guildId, weeklyReward);
    client.dbManager.updateXP(userId, guildId, 500);
    
    // Set cooldown
    client.dbManager.setCooldown(userId, guildId, 'weekly', cooldownMs);
    
    const embed = new EmbedBuilder()
      .setTitle('🎉 Weekly Reward Claimed!')
      .setDescription(`You received **${weeklyReward.toLocaleString()} coins**!`)
      .addFields(
        { name: '🎁 Weekly Reward', value: `+${weeklyReward}`, inline: true },
        { name: '⭐ XP Earned', value: '+500', inline: true },
        { name: '⏰ Next Weekly', value: '7 days', inline: true }
      )
      .setColor(0x9b59b6);
    
    await interaction.reply({ embeds: [embed] });
  }
};