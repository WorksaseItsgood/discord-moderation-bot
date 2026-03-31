const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

// Achievements command - Achievement system
module.exports = {
  data: new SlashCommandBuilder()
    .setName('achievements')
    .setDescription('View your achievements'),
  async execute(interaction, client) {
    const userId = interaction.user.id;
    
    if (!client.achievements) client.achievements = new Map();
    const userAchievements = client.achievements.get(userId) || [];
    
    const allAchievements = [
      { id: 'first_warn', name: 'First Warning', desc: 'Get warned for the first time', icon: '⚠️' },
      { id: 'first_ban', name: 'Banned', desc: 'Get banned for the first time', icon: '🔨' },
      { id: 'first_join', name: 'Getting Started', desc: 'Join your first server with the bot', icon: '👋' },
      { id: 'rich', name: 'Rich', desc: 'Have over 1000 coins', icon: '💰' },
      { id: 'gambler', name: 'Gambler', desc: 'Win your first bet', icon: '🎰' },
      { id: 'married', name: 'Married', desc: 'Get married', icon: '💍' },
      { id: 'fisher', name: 'Fisherman', desc: 'Catch 10 fish', icon: '🎣' },
      { id: 'hunter', name: 'Hunter', desc: 'Catch 10 prey', icon: '🏹' },
      { id: 'miners', name: 'Miner', desc: 'Mine 10 ore', icon: '⛏️' },
      { id: 'chopper', name: 'Lumberjack', desc: 'Chop 10 wood', icon: '🪓' }
    ];
    
    let description = '';
    for (const a of allAchievements) {
      const earned = userAchievements.includes(a.id);
      description += (earned ? a.icon : '🔒') + ' **' + a.name + '** - ' + a.desc + '\n';
    }
    
    const embed = new EmbedBuilder()
      .setTitle('🏆 Achievements')
      .setColor(0xffd700)
      .setDescription(description)
      .setFooter({ text: userAchievements.length + '/' + allAchievements.length + ' unlocked' });
    
    await interaction.reply({ embeds: [embed] });
  }
};