/**
 * Leaderboard Command - Server leaderboard with pagination
 */

const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { leaderboard, COLORS } = require('../../utils/embedTemplates');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('leaderboard')
    .setDescription('View the server leaderboard')
    .addStringOption(option =>
      option.setName('type')
        .setDescription('Leaderboard type')
        .setRequired(false)
        .addChoices(
          { name: '💰 Balance', value: 'balance' },
          { name: '⭐ XP', value: 'xp' },
          { name: '📊 Level', value: 'level' }
        )),
  
  async execute(interaction, client) {
    const type = interaction.options.getString('type') || 'balance';
    const botAvatar = client.user?.displayAvatarURL() || 'https://cdn.discordapp.com/embed/avatars/0.png';
    
    // Get economy data
    if (!client.economy) {
      client.economy = new Map();
    }
    
    // Convert map to array and sort
    const entries = Array.from(client.economy.entries())
      .filter(([key]) => key.startsWith(interaction.guild.id))
      .map(([key, data]) => {
        const userId = key.replace(`${interaction.guild.id}-`, '');
        return {
          userId,
          ...data,
          balance: data.wallet + data.bank,
          value: type === 'balance' ? data.wallet + data.bank : 
                type === 'xp' ? data.totalxp : data.level
        };
      })
      .sort((a, b) => b.value - a.value)
      .slice(0, 50);
    
    // Get user's rank
    const userKey = `${interaction.guild.id}-${interaction.user.id}`;
    const userData = client.economy.get(userKey);
    let userRank = null;
    
    if (userData) {
      const userValue = type === 'balance' ? userData.wallet + userData.bank : 
                     type === 'xp' ? userData.totalxp : userData.level;
      userRank = entries.findIndex(e => e.value > userValue) + 1 || entries.length + 1;
    }
    
    // Pagination settings
    const itemsPerPage = 10;
    const totalPages = Math.ceil(entries.length / itemsPerPage) || 1;
    let currentPage = 1;
    
    // Create leaderboard embed
    const createLeaderboardEmbed = (page) => {
      const start = (page - 1) * itemsPerPage;
      const pageEntries = entries.slice(start, start + itemsPerPage);
      
      const medalEmojis = { 1: '🥇', 2: '🥈', 3: '🥉' };
      
      const embed = new EmbedBuilder()
        .setColor(COLORS.economy)
        .setAuthor({
          name: '🏆 Leaderboard',
          iconURL: botAvatar
        })
        .setTitle(`💰 ${type === 'balance' ? 'Balance' : type === 'xp' ? 'XP' : 'Level'} Leaderboard`)
        .setDescription(`Top members of ${interaction.guild.name}`)
        .setThumbnail(interaction.guild.iconURL())
        .setFooter({
          text: `CrowBot • Page ${page}/${totalPages}`,
          iconURL: botAvatar
        })
        .setTimestamp();
      
      // Add entries
      if (pageEntries.length > 0) {
        embed.addFields(
          pageEntries.map((entry, index) => {
            const rank = start + index + 1;
            const displayValue = type === 'balance' 
              ? `$${entry.value.toLocaleString()}` 
              : type === 'xp'
              ? `${entry.value.toLocaleString()} XP`
              : `Level ${entry.value}`;
            
            return {
              name: `${medalEmojis[rank] || '🔹'} #${rank}`,
              value: `<@${entry.userId}>\n${displayValue}`,
              inline: true
            };
          })
        );
      } else {
        embed.addFields({
          name: '📭 No entries yet',
          value: 'Be the first to appear on the leaderboard!',
          inline: false
        });
      }
      
      // Add user rank if available
      if (userRank && page === 1) {
        embed.addFields({
          name: '📊 Your Rank',
          value: `#${userRank}`,
          inline: false
        });
      }
      
      return embed;
    };
    
    // Initial response
    const embed = createLeaderboardEmbed(currentPage);
    
    // Create pagination buttons
    const buttonRow = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('lb-prev')
          .setLabel('⬅️ Previous')
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(true),
        new ButtonBuilder()
          .setLabel(`${currentPage}/${totalPages}`)
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(true),
        new ButtonBuilder()
          .setCustomId('lb-next')
          .setLabel('Next ➡️')
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(totalPages <= 1)
      );
    
    // Add type selection buttons
    const typeRow = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('lb-balance')
          .setLabel('💰 Balance')
          .setStyle(type === 'balance' ? ButtonStyle.Primary : ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId('lb-xp')
          .setLabel('⭐ XP')
          .setStyle(type === 'xp' ? ButtonStyle.Primary : ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId('lb-level')
          .setLabel('📊 Level')
          .setStyle(type === 'level' ? ButtonStyle.Primary : ButtonStyle.Secondary)
      );
    
    await interaction.reply({ embeds: [embed], components: totalPages > 1 ? [typeRow, buttonRow] : [typeRow] });
    
    // Create collector for pagination
    if (totalPages > 1) {
      const filter = i => i.customId.startsWith('lb-');
      const collector = interaction.message.createMessageComponentCollector({ filter, time: 60000 });
      
      collector.on('collect', async (i) => {
        if (i.customId === 'lb-prev') {
          currentPage = Math.max(1, currentPage - 1);
        } else if (i.customId === 'lb-next') {
          currentPage = Math.min(totalPages, currentPage + 1);
        } else if (i.customId.startsWith('lb-')) {
          // Type change
          const newType = i.customId.replace('lb-', '');
          // Recreate leaderboard for new type
          await i.update({ 
            embeds: [createLeaderboardEmbed(1)], 
            components: [typeRow] 
          });
          return;
        }
        
        const newEmbed = createLeaderboardEmbed(currentPage);
        
        // Update buttons
        const newButtonRow = new ActionRowBuilder()
          .addComponents(
            new ButtonBuilder()
              .setCustomId('lb-prev')
              .setLabel('⬅️ Previous')
              .setStyle(ButtonStyle.Secondary)
              .setDisabled(currentPage <= 1),
            new ButtonBuilder()
              .setLabel(`${currentPage}/${totalPages}`)
              .setStyle(ButtonStyle.Secondary)
              .setDisabled(true),
            new ButtonBuilder()
              .setCustomId('lb-next')
              .setLabel('Next ➡️')
              .setStyle(ButtonStyle.Secondary)
              .setDisabled(currentPage >= totalPages)
          );
        
        await i.update({ embeds: [newEmbed], components: [typeRow, newButtonRow] });
      });
    }
  }
};