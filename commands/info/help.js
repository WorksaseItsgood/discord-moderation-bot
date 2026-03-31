/**
 * Help Command - Interactive help menu with button categories
 */

const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } = require('discord.js');
const { success, info, COLORS } = require('../../utils/embedTemplates');
const { categoryButtons, stringSelectMenu } = require('../../utils/buttonComponents');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Show help menu with all bot commands')
    .addStringOption(option =>
      option.setName('category')
        .setDescription('Category to show help for')
        .addChoices(
          { name: '🛡️ Moderation', value: 'moderation' },
          { name: '💰 Economy', value: 'economy' },
          { name: '🎵 Music', value: 'music' },
          { name: '🎫 Tickets', value: 'tickets' },
          { name: '⚙️ Utility', value: 'utility' },
          { name: '🎮 Fun', value: 'fun' },
          { name: '🎮 Games', value: 'games' },
          { name: '🎁 Giveaway', value: 'giveaway' },
          { name: '💡 Suggestions', value: 'suggestions' },
          { name: 'ℹ️ Info', value: 'info' }
        )
    ),
  
  async execute(interaction, client) {
    const category = interaction.options.getString('category');
    const botAvatar = client.user?.displayAvatarURL() || 'https://cdn.discordapp.com/embed/avatars/0.png';
    
    // Command categories with detailed commands
    const categories = {
      moderation: {
        emoji: '🛡️',
        color: COLORS.moderation,
        commands: [
          { name: '/ban', desc: 'Ban a user from the server', usage: '/ban <user> [reason]' },
          { name: '/unban', desc: 'Unban a user', usage: '/unban <user>' },
          { name: '/kick', desc: 'Kick a user', usage: '/kick <user> [reason]' },
          { name: '/mute', desc: 'Mute a user', usage: '/mute <user> [duration]' },
          { name: '/unmute', desc: 'Unmute a user', usage: '/unmute <user>' },
          { name: '/warn', desc: 'Warn a user', usage: '/warn <user> <reason>' },
          { name: '/warnings', desc: 'View user warnings', usage: '/warnings [user]' },
          { name: '/clearwarns', desc: 'Clear all warnings', usage: '/clearwarns [user]' },
          { name: '/lock', desc: 'Lock a channel', usage: '/lock [channel]' },
          { name: '/unlock', desc: 'Unlock a channel', usage: '/unlock [channel]' },
          { name: '/slowmode', desc: 'Set slowmode', usage: '/slowmode <seconds>' },
          { name: '/purge', desc: 'Delete messages', usage: '/purge <amount>' },
          { name: '/role', desc: 'Manage roles', usage: '/role <user> <role>' },
          { name: '/deafen', desc: 'Deafen a user', usage: '/deafen <user>' },
          { name: '/disconnect', desc: 'Disconnect from voice', usage: '/disconnect <user>' }
        ]
      },
      economy: {
        emoji: '💰',
        color: COLORS.economy,
        commands: [
          { name: '/balance', desc: 'Check your balance', usage: '/balance [user]' },
          { name: '/daily', desc: 'Claim daily rewards', usage: '/daily' },
          { name: '/weekly', desc: 'Claim weekly rewards', usage: '/weekly' },
          { name: '/beg', desc: 'Beg for coins', usage: '/beg' },
          { name: '/gamble', desc: 'Gamble your coins', usage: '/gamble <amount>' },
          { name: '/rob', desc: 'Rob another user', usage: '/rob <user>' },
          { name: '/pay', desc: 'Pay another user', usage: '/pay <user> <amount>' },
          { name: '/rank', desc: 'Check your rank/XP', usage: '/rank [user]' },
          { name: '/leaderboard', desc: 'Server leaderboard', usage: '/leaderboard' },
          { name: '/work', desc: 'Work for coins', usage: '/work' },
          { name: '/deposit', desc: 'Deposit to bank', usage: '/deposit <amount>' },
          { name: '/withdraw', desc: 'Withdraw from bank', usage: '/withdraw <amount>' },
          { name: '/store', desc: 'View item store', usage: '/store' },
          { name: '/buy', desc: 'Buy an item', usage: '/buy <item>' }
        ]
      },
      music: {
        emoji: '🎵',
        color: COLORS.music,
        commands: [
          { name: '/play', desc: 'Play music', usage: '/play <query>' },
          { name: '/pause', desc: 'Pause music', usage: '/pause' },
          { name: '/resume', desc: 'Resume music', usage: '/resume' },
          { name: '/stop', desc: 'Stop music', usage: '/stop' },
          { name: '/skip', desc: 'Skip song', usage: '/skip' },
          { name: '/queue', desc: 'View queue', usage: '/queue' },
          { name: '/shuffle', desc: 'Shuffle queue', usage: '/shuffle' },
          { name: '/loop', desc: 'Loop queue/song', usage: '/loop' },
          { name: '/volume', desc: 'Set volume', usage: '/volume [level]' },
          { name: '/nowplaying', desc: 'Current song', usage: '/nowplaying' }
        ]
      },
      tickets: {
        emoji: '🎫',
        color: COLORS.tickets,
        commands: [
          { name: '/ticket-create', desc: 'Create a ticket', usage: '/ticket-create [category]' },
          { name: '/ticket-close', desc: 'Close ticket', usage: '/ticket-close' },
          { name: '/ticket-add', desc: 'Add user to ticket', usage: '/ticket-add <user>' },
          { name: '/ticket-remove', desc: 'Remove user', usage: '/ticket-remove <user>' },
          { name: '/ticket-panel', desc: 'Create ticket panel', usage: '/ticket-panel' }
        ]
      },
      utility: {
        emoji: '⚙️',
        color: COLORS.utility,
        commands: [
          { name: '/server-info', desc: 'Server information', usage: '/server-info' },
          { name: '/user-info', desc: 'User information', usage: '/user-info [user]' },
          { name: '/avatar', desc: 'User avatar', usage: '/avatar [user]' },
          { name: '/banner', desc: 'User banner', usage: '/banner [user]' },
          { name: '/role-info', desc: 'Role information', usage: '/role-info <role>' },
          { name: '/channel-info', desc: 'Channel info', usage: '/channel-info [channel]' },
          { name: '/emojis', desc: 'Server emojis', usage: '/emojis' },
          { name: '/poll', desc: 'Create poll', usage: '/poll <question>...' },
          { name: '/remind', desc: 'Set reminder', usage: '/remind <time> <message>' },
          { name: '/translate', desc: 'Translate text', usage: '/translate <text> [language]' }
        ]
      },
      fun: {
        emoji: '😄',
        color: COLORS.fun,
        commands: [
          { name: '/8ball', desc: 'Ask the magic 8ball', usage: '/8ball <question>' },
          { name: '/joke', desc: 'Tell a joke', usage: '/joke' },
          { name: '/meme', desc: 'Get a random meme', usage: '/meme' },
          { name: '/roast', desc: 'Roast someone', usage: '/roast <user>' },
          { name: '/compliment', desc: 'Give a compliment', usage: '/compliment [user]' },
          { name: '/ship', desc: 'Ship users', usage: '/ship <user1> <user2>' },
          { name: '/kill', desc: 'Kill someone', usage: '/kill <user>' },
          { name: '/cuddle', desc: 'Cuddle someone', usage: '/cuddle <user>' },
          { name: '/hug', desc: 'Hug someone', usage: '/hug <user>' },
          { name: '/kiss', desc: 'Kiss someone', usage: '/kiss <user>' }
        ]
      },
      games: {
        emoji: '🎮',
        color: COLORS.fun,
        commands: [
          { name: '/rps', desc: 'Rock Paper Scissors', usage: '/rps <choice>' },
          { name: '/hangman', desc: 'Play hangman', usage: '/hangman [word]' },
          { name: '/trivia', desc: 'Play trivia', usage: '/trivia' },
          { name: '/blackjack', desc: 'Play blackjack', usage: '/blackjack <bet>' },
          { name: '/slots', desc: 'Play slots', usage: '/slots [bet]' },
          { name: '/duel', desc: 'Challenge to duel', usage: '/duel <user>' },
          { name: '/heist', desc: 'Plan a heist', usage: '/heist <users>...' },
          { name: '/fish', desc: 'Go fishing', usage: '/fish' }
        ]
      },
      giveaway: {
        emoji: '🎁',
        color: COLORS.success,
        commands: [
          { name: '/giveaway', desc: 'List giveaways', usage: '/giveaway' },
          { name: '/giveaway-create', desc: 'Create giveaway', usage: '/giveaway-create' },
          { name: '/giveaway-end', desc: 'End giveaway', usage: '/giveaway-end <message>' },
          { name: '/giveaway-reroll', desc: 'Reroll winners', usage: '/giveaway-reroll <message>' }
        ]
      },
      suggestions: {
        emoji: '💡',
        color: COLORS.secondary,
        commands: [
          { name: '/suggest', desc: 'Make a suggestion', usage: '/suggest <idea>' },
          { name: '/accept-suggest', desc: 'Accept suggestion', usage: '/accept-suggest <message>' },
          { name: '/reject-suggest', desc: 'Reject suggestion', usage: '/reject-suggest <message>' }
        ]
      },
      info: {
        emoji: 'ℹ️',
        color: COLORS.secondary,
        commands: [
          { name: '/ping', desc: 'Check bot ping', usage: '/ping' },
          { name: '/bot-stats', desc: 'Bot statistics', usage: '/bot-stats' },
          { name: '/uptime', desc: 'Bot uptime', usage: '/uptime' },
          { name: '/invite', desc: 'Get bot invite', usage: '/invite' }
        ]
      }
    };
    
    // If a specific category is selected
    if (category && categories[category]) {
      const cat = categories[category];
      
      const embed = new EmbedBuilder()
        .setColor(cat.color)
        .setAuthor({
          name: `${cat.emoji} ${category.charAt(0).toUpperCase() + category.slice(1)} Commands`,
          iconURL: botAvatar
        })
        .setTitle(`${cat.emoji} ${category.charAt(0).toUpperCase() + category.slice(1)} Commands`)
        .setDescription(`Here are all the ${category} commands available:`)
        .setThumbnail(botAvatar)
        .setFooter({
          text: `CrowBot • Page 1/1`,
          iconURL: botAvatar
        })
        .setTimestamp();
      
      // Add command fields
      const commandsPerPage = 15;
      for (let i = 0; i < cat.commands.length; i += commandsPerPage) {
        const pageCommands = cat.commands.slice(i, i + commandsPerPage);
        const commandFields = pageCommands.map(cmd => ({
          name: `/${cmd.name}`,
          value: `${cmd.desc}\n\`${cmd.usage}\``,
          inline: false
        }));
        embed.addFields(commandFields);
      }
      
      return interaction.reply({ embeds: [embed] });
    }
    
    // Main help menu with category buttons
    const embed = new EmbedBuilder()
      .setColor(COLORS.primary)
      .setAuthor({
        name: '🤖 CrowBot Help',
        iconURL: botAvatar
      })
      .setTitle('🤖 CrowBot Command List')
      .setDescription('Welcome to the help menu! Select a category below to explore all commands.')
      .setThumbnail(botAvatar)
      .setFooter({
        text: 'CrowBot • Use /help <category> for specific help',
        iconURL: botAvatar
      })
      .setTimestamp()
      .addFields([
        { name: '📋 Quick Links', value: 'Use the buttons below or dropdown to navigate categories', inline: false },
        { name: '💡 Tip', value: 'Use `/help <category>` for detailed command info', inline: false }
      ]);
    
    // Create category buttons
    const categoryBtns = [
      { customId: 'help-mod', label: '🛡️ Mod', emoji: '🛡️' },
      { customId: 'help-economy', label: '💰 Economy', emoji: '💰' },
      { customId: 'help-music', label: '🎵 Music', emoji: '🎵' },
      { customId: 'help-tickets', label: '🎫 Tickets', emoji: '🎫' },
      { customId: 'help-utility', label: '⚙️ Utility', emoji: '⚙️' },
      { customId: 'help-fun', label: '😄 Fun', emoji: '😄' },
      { customId: 'help-games', label: '🎮 Games', emoji: '🎮' },
      { customId: 'help-giveaway', label: '🎁 Giveaway', emoji: '🎁' },
      { customId: 'help-suggestions', label: '💡 Ideas', emoji: '💡' },
      { customId: 'help-info', label: 'ℹ️ Info', emoji: 'ℹ️' }
    ];
    
    // Create button rows
    const rows = [];
    for (let i = 0; i < categoryBtns.length; i += 5) {
      const row = new ActionRowBuilder();
      const chunk = categoryBtns.slice(i, i + 5);
      for (const cat of chunk) {
        row.addComponents(
          new ButtonBuilder()
            .setCustomId(cat.customId)
            .setLabel(cat.label)
            .setStyle(ButtonStyle.Secondary)
        );
      }
      rows.push(row);
    }
    
    // Add dropdown for quick access
    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId('help-select')
      .setPlaceholder('📋 Select a category...')
      .addOptions(
        new StringSelectMenuOptionBuilder()
          .setLabel('🛡️ Moderation')
          .setValue('moderation')
          .setDescription('Ban, kick, mute, warn...'),
        new StringSelectMenuOptionBuilder()
          .setLabel('💰 Economy')
          .setValue('economy')
          .setDescription('Balance, gamble, work...'),
        new StringSelectMenuOptionBuilder()
          .setLabel('🎵 Music')
          .setValue('music')
          .setDescription('Play, skip, queue...'),
        new StringSelectMenuOptionBuilder()
          .setLabel('🎫 Tickets')
          .setValue('tickets')
          .setDescription('Create, close tickets...'),
        new StringSelectMenuOptionBuilder()
          .setLabel('⚙️ Utility')
          .setValue('utility')
          .setDescription('Server info, polls...'),
        new StringSelectMenuOptionBuilder()
          .setLabel('😄 Fun')
          .setValue('fun')
          .setDescription('Memes, jokes...'),
        new StringSelectMenuOptionBuilder()
          .setLabel('🎮 Games')
          .setValue('games')
          .setDescription('Hangman, trivia...'),
        new StringSelectMenuOptionBuilder()
          .setLabel('🎁 Giveaway')
          .setValue('giveaway')
          .setDescription('Create giveaways...'),
        new StringSelectMenuOptionBuilder()
          .setLabel('💡 Suggestions')
          .setValue('suggestions')
          .setDescription('Suggest features...'),
        new StringSelectMenuOptionBuilder()
          .setLabel('ℹ️ Info')
          .setValue('info')
          .setDescription('Ping, stats...')
      );
    
    const selectRow = new ActionRowBuilder().addComponents(selectMenu);
    rows.push(selectRow);
    
    await interaction.reply({ embeds: [embed], components: rows });
  }
};