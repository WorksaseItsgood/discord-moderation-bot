const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

const categoryData = {
  moderation: {
    emoji: '🛡️',
    color: 0xE74C3C,
    description: 'Moderation commands to manage your server',
    commands: [
      { name: 'ban', value: 'Ban a user from the server', usage: '/ban @user [reason]' },
      { name: 'unban', value: 'Unban a user', usage: '/unban <user_id>' },
      { name: 'kick', value: 'Kick a user from the server', usage: '/kick @user [reason]' },
      { name: 'mute', value: 'Mute a user', usage: '/mute @user [reason] [duration]' },
      { name: 'unmute', value: 'Unmute a user', usage: '/unmute @user' },
      { name: 'warn', value: 'Warn a user', usage: '/warn @user [reason]' },
      { name: 'warnings', value: 'View all warnings for a user', usage: '/warnings [user]' },
      { name: 'clearwarns', value: 'Clear all warnings for a user', usage: '/clearwarns @user' },
      { name: 'lock', value: 'Lock a channel', usage: '/lock [channel]' },
      { name: 'unlock', value: 'Unlock a channel', usage: '/unlock [channel]' },
      { name: 'slowmode', value: 'Set slowmode for a channel', usage: '/slowmode [seconds]' },
      { name: 'purge', value: 'Delete messages in bulk', usage: '/purge <amount>' }
    ]
  },
  fun: {
    emoji: '🎮',
    color: 0xFEE75C,
    description: 'Fun commands for entertainment',
    commands: [
      { name: 'meme', value: 'Get a random meme', usage: '/meme' },
      { name: 'joke', value: 'Get a random joke', usage: '/joke' },
      { name: '8ball', value: 'Ask the magic 8ball', usage: '/8ball <question>' },
      { name: 'riddle', value: 'Get a riddle to solve', usage: '/riddle' },
      { name: 'roast', value: 'Roast someone', usage: '/roast @user' },
      { name: 'slots', value: 'Play the slot machine', usage: '/slots [bet]' },
      { name: 'trivia', value: 'Play trivia game', usage: '/trivia' },
      { name: 'would-you-rather', value: 'Play would you rather', usage: '/wyr' },
      { name: 'ship', value: 'Ship two users', usage: '/ship @user1 @user2' }
    ]
  },
  economy: {
    emoji: '💰',
    color: 0x57F287,
    description: 'Economy system to earn and spend virtual money',
    commands: [
      { name: 'balance', value: 'Check your balance', usage: '/balance [user]' },
      { name: 'daily', value: 'Claim daily rewards', usage: '/daily' },
      { name: 'beg', value: 'Beg for money', usage: '/beg' },
      { name: 'shop', value: 'View the shop', usage: '/shop' },
      { name: 'buy', value: 'Buy an item', usage: '/buy <item>' },
      { name: 'leaderboard', value: 'View richest users', usage: '/leaderboard' }
    ]
  },
  utility: {
    emoji: '🔧',
    color: 0x5865F2,
    description: 'Useful utility commands',
    commands: [
      { name: 'ping', value: 'Check bot ping', usage: '/ping' },
      { name: 'avatar', value: 'Get user avatar', usage: '/avatar [user]' },
      { name: 'serverinfo', value: 'Get server info', usage: '/serverinfo' },
      { name: 'userinfo', value: 'Get user info', usage: '/userinfo [user]' },
      { name: 'roleinfo', value: 'Get role info', usage: '/roleinfo <role>' },
      { name: 'poll', value: 'Create a poll', usage: '/poll <question> [options...]' },
      { name: 'remind', value: 'Set a reminder', usage: '/remind <time> <message>' }
    ]
  },
  music: {
    emoji: '🎵',
    color: 0x9B59B6,
    description: 'Music commands to play songs',
    commands: [
      { name: 'play', value: 'Play a song', usage: '/play <song>' },
      { name: 'skip', value: 'Skip current song', usage: '/skip' },
      { name: 'queue', value: 'View the queue', usage: '/queue' },
      { name: 'pause', value: 'Pause music', usage: '/pause' },
      { name: 'resume', value: 'Resume music', usage: '/resume' },
      { name: 'stop', value: 'Stop music', usage: '/stop' },
      { name: 'volume', value: 'Set volume', usage: '/volume [0-100]' }
    ]
  }
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName('embed-help')
    .setDescription('Interactive help with beautiful embeds'),
  async execute(interaction, client) {
    const categories = Object.keys(categoryData);
    
    const row = new ActionRowBuilder();
    
    for (const [key, cat] of Object.entries(categoryData)) {
      row.addComponents(
        new ButtonBuilder()
          .setCustomId(`embedhelp_${key}`)
          .setLabel(cat.emoji + ' ' + key.charAt(0).toUpperCase() + key.slice(1))
          .setStyle(ButtonStyle.Secondary)
      );
    }
    
    const mainEmbed = new EmbedBuilder()
      .setColor(0x2F3136)
      .setTitle('📚 Help Center')
      .setDescription('Welcome to the Nootic Moderation bot help!\n\nSelect a category below to view its commands.')
      .addFields(
        ...Object.entries(categoryData).map(([key, cat]) => ({
          name: `${cat.emoji} ${key.charAt(0).toUpperCase() + key.slice(1)}`,
          value: cat.description,
          inline: true
        }))
      )
      .setFooter({ text: 'Niotic Moderation • Click a button to view commands' })
      .setTimestamp();
    
    await interaction.reply({ embeds: [mainEmbed], components: [row], ephemeral: true });
    
    const message = await interaction.fetchReply();
    
    const collector = message.createMessageComponentCollector({
      componentType: 2,
      time: 120000
    });
    
    collector.on('collect', async (btn) => {
      const category = btn.customId.replace('embedhelp_', '');
      const catData = categoryData[category];
      
      if (!catData) return;
      
      const embed = new EmbedBuilder()
        .setColor(catData.color)
        .setTitle(`${catData.emoji} ${category.charAt(0).toUpperCase() + category.slice(1)} Commands`)
        .setDescription(catData.description)
        .addFields(
          ...catData.commands.map(cmd => ({
            name: `/${cmd.name}`,
            value: `${cmd.value}\n\`${cmd.usage}\``,
            inline: false
          }))
        )
        .setFooter({ text: 'Niotic Moderation' })
        .setTimestamp();
      
      const backRow = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId('embedhelp_back')
            .setLabel('◀ Back to Categories')
            .setStyle(ButtonStyle.Primary)
        );
      
      await btn.update({ embeds: [embed], components: [backRow] });
    });
    
    collector.on('end', async (collected, reason) => {
      if (reason === 'time') {
        try {
          await message.edit({ components: [] });
        } catch (e) {}
      }
    });
  }
};