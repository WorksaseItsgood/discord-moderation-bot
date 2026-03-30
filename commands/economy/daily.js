/**
 * Daily Command - Claim daily rewards
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('daily')
    .setDescription('Claim your daily reward'),
  
  async execute(interaction, client) {
    const userId = interaction.user.id;
    const guildId = interaction.guildId;
    
    // Check cooldown (24 hours)
    const cooldownMs = 24 * 60 * 60 * 1000;
    const remaining = client.dbManager.getCooldown(userId, guildId, 'daily');
    
    if (remaining > 0) {
      const hours = Math.floor(remaining / (1000 * 60 * 60));
      const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
      
      const embed = new EmbedBuilder()
        .setTitle('⏳ Daily Cooldown')
        .setDescription(`You can claim your next daily in **${hours}h ${minutes}m**`)
        .setColor(0xffaa00);
      
      return interaction.reply({ embeds: [embed], ephemeral: true });
    }
    
    // Get user data
    const userData = client.dbManager.getOrCreateUser(userId, guildId);
    
    // Calculate reward (base + streak bonus)
    const streakBonus = Math.min(userData.daily_streak * 50, 500);
    const baseReward = 500;
    const dailyReward = baseReward + streakBonus;
    
    // Update balance and streak
    client.dbManager.updateBalance(userId, guildId, dailyReward);
    client.dbManager.updateXP(userId, guildId, 100);
    
    // Update streak
    const db = client.dbManager.getDB(guildId);
    const now = Math.floor(Date.now() / 1000);
    db.prepare(`
      INSERT INTO economy (user_id, daily_streak, last_daily) VALUES (?, 1, ?)
      ON CONFLICT(user_id) DO UPDATE SET 
        daily_streak = daily_streak + 1,
        last_daily = ?
    `).run(userId, now, now);
    
    // Set cooldown
    client.dbManager.setCooldown(userId, guildId, 'daily', cooldownMs);
    
    const embed = new EmbedBuilder()
      .setTitle('✅ Daily Reward Claimed!')
      .setDescription(`You received **${dailyReward.toLocaleString()} coins**!`)
      .addFields(
        { name: '🎁 Base Reward', value: `+${baseReward}`, inline: true },
        { name: '🔥 Streak Bonus', value: `+${streakBonus}`, inline: true },
        { name: '📅 Current Streak', value: `${userData.daily_streak + 1} days`, inline: true }
      )
      .setColor(0x00ff00);
    
    await interaction.reply({ embeds: [embed] });
  }
};