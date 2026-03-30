const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

// Rank command - show user rank and XP card
module.exports = {
  data: new SlashCommandBuilder()
    .setName('rank')
    .setDescription('View your rank card')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('User to check')
        .setRequired(false)),
  permissions: [],
  async execute(interaction, client) {
    const user = interaction.options.getUser('user') || interaction.user;
    const guildId = interaction.guild.id;
    const db = require('../database');
    
    const userData = db.getOrCreateUser(user.id, guildId);
    
    // Calculate level info
    const level = userData.level;
    const currentLevelXP = Math.pow(level - 1, 2) * 100;
    const nextLevelXP = Math.pow(level, 2) * 100;
    const xpProgress = userData.xp - currentLevelXP;
    const xpNeeded = nextLevelXP - currentLevelXP;
    const progressPercent = Math.min(100, Math.floor((xpProgress / xpNeeded) * 100));
    
    // Get rank in server (by XP)
    const allUsers = db.db.prepare('SELECT user_id FROM users WHERE guild_id = ? ORDER BY xp DESC').all(guildId);
    const rank = allUsers.findIndex(u => u.user_id === user.id) + 1;
    
    // Create rank card embed
    const progressBar = '█'.repeat(Math.floor(progressPercent / 10)) + '░'.repeat(10 - Math.floor(progressPercent / 10));
    
    const embed = new EmbedBuilder()
      .setTitle(`🏆 ${user.username}'s Rank Card`)
      .setColor(0x00ff00)
      .setThumbnail(user.displayAvatarURL())
      .addFields(
        { name: 'Rank', value: `#${rank} of ${allUsers.length}`, inline: true },
        { name: 'Level', value: `${level}`, inline: true },
        { name: 'XP', value: `${userData.xp} / ${nextLevelXP}`, inline: true },
        { name: 'Coins', value: `${userData.coins} 🪙`, inline: true },
        { name: 'Daily Streak', value: `${userData.streak} days 🔥`, inline: true }
      ))
      .setDescription(`\n📊 Progress: [${progressBar}] ${progressPercent}%\n${xpProgress} XP / ${xpNeeded} XP to Level ${level + 1}`);
    
    await interaction.reply({ embeds: [embed] });
  }
};