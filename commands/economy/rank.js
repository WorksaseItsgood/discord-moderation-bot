/**
 * Rank Command - Check your rank/XP with progress bar
 */

const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { rank, COLORS } = require('../../utils/embedTemplates');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('rank')
    .setDescription('Check your rank and XP')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('User to check rank for')
        .setRequired(false)),
  
  async execute(interaction, client) {
    const user = interaction.options.getUser('user') || interaction.user;
    const botAvatar = client.user?.displayAvatarURL() || 'https://cdn.discordapp.com/embed/avatars/0.png';
    
    // Get or initialize economy data
    if (!client.economy) {
      client.economy = new Map();
    }
    
    let userData = client.economy.get(`${interaction.guild.id}-${user.id}`);
    
    if (!userData) {
      userData = {
        wallet: 100,
        bank: 0,
        totalxp: 0,
        level: 1,
        daily: 0,
        weekly: 0,
        work: 0
      };
      // Don't save yet - only save if they have activity
    }
    
    const { totalxp, level, wallet, bank } = userData;
    const balance = (wallet || 0) + (bank || 0);
    
    // Calculate XP needed for next level
    const xpForLevel = level => level * 100;
    const currentLevelXP = xpForLevel(level);
    const nextLevelXP = xpForLevel(level + 1);
    const xpForNextLevel = nextLevelXP - currentLevelXP;
    const currentLevelProgress = totalxp - currentLevelXP;
    
    // Calculate rank
    const entries = Array.from(client.economy.entries())
      .filter(([key]) => key.startsWith(interaction.guild.id))
      .map(([key, data]) => ({
        userId: key.replace(`${interaction.guild.id}-`, ''),
        totalxp: data.totalxp || 0
      }))
      .sort((a, b) => b.totalxp - a.totalxp);
    
    const userRank = entries.findIndex(e => e.totalxp > totalxp) + 1 || entries.length || 'N/A';
    
    // Progress bar
    const progress = Math.min(Math.round((currentLevelProgress / xpForNextLevel) * 10), 10);
    const progressBar = '█'.repeat(progress) + '░'.repeat(Math.max(0, 10 - progress));
    
    // Create beautiful rank embed
    const embed = new EmbedBuilder()
      .setColor(COLORS.secondary)
      .setAuthor({
        name: `🏆 ${user.username}'s Rank`,
        iconURL: botAvatar
      })
      .setTitle(`${userRank === 1 ? '🥇' : userRank === 2 ? '🥈' : userRank === 3 ? '🥉' : '🔹'} Rank #${userRank}`)
      .setDescription(`**${user.username}** is level **${level}**`)
      .setThumbnail(user.displayAvatarURL())
      .setFooter({
        text: `CrowBot • ${totalxp} XP total`,
        iconURL: botAvatar
      })
      .setTimestamp()
      .addFields(
        { 
          name: '⭐ XP Progress', 
          value: `\`${progressBar}\`\n${currentLevelProgress}/${xpForNextLevel} XP to Level ${level + 1}`, 
          inline: false 
        },
        { 
          name: '📊 Statistics', 
          value: `**Level:** ${level}\n**Total XP:** ${totalxp.toLocaleString()}\n**Server Rank:** #${userRank}`, 
          inline: true 
        },
        { 
          name: '💰 Economy', 
          value: `**Balance:** $${balance.toLocaleString()}\n**Daily:** ${userData.daily ? '✅ Claimed' : '❌ Available'}\n**Work:** ${userData.work ? '✅ Done' : '❌ Available'}`, 
          inline: true 
        }
      );
    
    // Action buttons
    const buttonRow = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('rank-daily')
          .setLabel('📅 Daily')
          .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
          .setCustomId('rank-work')
          .setLabel('💼 Work')
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId('rank-leaderboard')
          .setLabel('🏆 Leaderboard')
          .setStyle(ButtonStyle.Secondary)
      );
    
    await interaction.reply({ embeds: [embed], components: [buttonRow] });
  }
};