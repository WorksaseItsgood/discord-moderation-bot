/**
 * Leaderboard Command - Show server economy leaderboard
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('leaderboard')
    .setDescription('Show the server economy leaderboard')
    .addStringOption(option =>
      option.setName('type')
        .setDescription('Leaderboard type')
        .addChoices(
          { name: 'Balance', value: 'balance' },
          { name: 'XP', value: 'xp' },
          { name: 'Level', value: 'level' }
        )
    )
    .addIntegerOption(option =>
      option.setName('limit')
        .setDescription('Number of users to show (default 10)')
    ),
  
  async execute(interaction, client) {
    const type = interaction.options.getString('type') || 'balance';
    const limit = Math.min(interaction.options.getInteger('limit') || 10, 25);
    const guildId = interaction.guildId;
    
    // Get leaderboard
    const leaderboard = client.dbManager.getLeaderboard(guildId, type, limit);
    
    if (leaderboard.length === 0) {
      return interaction.reply({ content: 'No users on the leaderboard yet!', ephemeral: true });
    }
    
    // Build leaderboard embed
    const embed = new EmbedBuilder()
      .setTitle(`🏆 ${type.charAt(0).toUpperCase() + type.slice(1)} Leaderboard`)
      .setColor(0xffd700);
    
    let description = '';
    let position = 1;
    
    for (const user of leaderboard) {
      const member = await interaction.guild.members.fetch(user.user_id).catch(() => null);
      const username = member ? member.user.username : 'Unknown User';
      
      let value;
      switch (type) {
        case 'xp':
          value = `${user.xp} XP (Level ${user.level})`;
          break;
        case 'level':
          value = `Level ${user.level}`;
          break;
        default:
          value = `${user.balance} coins`;
      }
      
      const medal = position === 1 ? '🥇' : position === 2 ? '🥈' : position === 3 ? '🥉' : `${position}.`;
      description += `**${medal} ${username}**\n${value}\n\n`;
      
      position++;
    }
    
    embed.setDescription(description);
    
    await interaction.reply({ embeds: [embed] });
  }
};