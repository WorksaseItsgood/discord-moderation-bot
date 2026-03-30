/**
 * Help Command - Interactive help menu
 */

const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Show help menu')
    .addStringOption(option =>
      option.setName('category')
        .setDescription('Category to show help for')
        .addChoices(
          { name: 'Moderation', value: 'moderation' },
          { name: 'Economy', value: 'economy' },
          { name: 'Music', value: 'music' },
          { name: 'Tickets', value: 'tickets' },
          { name: 'Utility', value: 'utility' },
          { name: 'Game', value: 'game' }
        )
    ),
  
  async execute(interaction, client) {
    const category = interaction.options.getString('category');
    
    const categories = {
      moderation: {
        title: '🛡️ Moderation Commands',
        commands: [
          { name: '/ban', desc: 'Ban a user' },
          { name: '/unban', desc: 'Unban a user' },
          { name: '/kick', desc: 'Kick a user' },
          { name: '/mute', desc: 'Mute a user' },
          { name: '/unmute', desc: 'Unmute a user' },
          { name: '/warn', desc: 'Warn a user' },
          { name: '/warnings', desc: 'View warnings' },
          { name: '/clearwarns', desc: 'Clear warnings' },
          { name: '/lock', desc: 'Lock a channel' },
          { name: '/unlock', desc: 'Unlock a channel' },
          { name: '/slowmode', desc: 'Set slowmode' },
          { name: '/purge', desc: 'Delete messages' },
          { name: '/role', desc: 'Add/remove role' }
        ]
      },
      economy: {
        title: '💰 Economy Commands',
        commands: [
          { name: '/balance', desc: 'Check your balance' },
          { name: '/daily', desc: 'Claim daily rewards' },
          { name: '/weekly', desc: 'Claim weekly rewards' },
          { name: '/beg', desc: 'Beg for coins' },
          { name: '/gamble', desc: 'Gamble coins' },
          { name: '/rob', desc: 'Rob another user' },
          { name: '/pay', desc: 'Pay another user' },
          { name: '/rank', desc: 'Check your rank/XP' },
          { name: '/leaderboard', desc: 'Server leaderboard' }
        ]
      },
      music: {
        title: '🎵 Music Commands',
        commands: [
          { name: '/play', desc: 'Play music' },
          { name: '/stop', desc: 'Stop music' },
          { name: '/skip', desc: 'Skip song' },
          { name: '/queue', desc: 'View queue' },
          { name: '/volume', desc: 'Set volume' }
        ]
      },
      tickets: {
        title: '🎫 Ticket Commands',
        commands: [
          { name: '/ticket-create', desc: 'Create a ticket' },
          { name: '/ticket-close', desc: 'Close ticket' },
          { name: '/ticket-add', desc: 'Add user to ticket' },
          { name: '/ticket-remove', desc: 'Remove user from ticket' },
          { name: '/ticket-panel', desc: 'Create ticket panel' }
        ]
      },
      utility: {
        title: '🔧 Utility Commands',
        commands: [
          { name: '/server-info', desc: 'Server information' },
          { name: '/user-info', desc: 'User information' },
          { name: '/avatar', desc: 'User avatar' },
          { name: '/banner', desc: 'User banner' },
          { name: '/role-info', desc: 'Role information' },
          { name: '/channel-info', desc: 'Channel information' },
          { name: '/emojis', desc: 'Server emojis' },
          { name: '/poll', desc: 'Create poll' },
          { name: '/ping', desc: 'Check ping' },
          { name: '/bot-stats', desc: 'Bot statistics' }
        ]
      },
      game: {
        title: '🎮 Game Commands',
        commands: [
          { name: '/8ball', desc: 'Ask the magic 8ball' },
          { name: '/rps', desc: 'Rock Paper Scissors' }
        ]
      }
    };
    
    const embed = new EmbedBuilder()
      .setColor(0x0099ff);
    
    if (category && categories[category]) {
      const cat = categories[category];
      embed.setTitle(cat.title);
      
      let desc = '';
      for (const cmd of cat.commands) {
        desc += `**${cmd.name}** - ${cmd.desc}\n`;
      }
      embed.setDescription(desc);
    } else {
      embed.setTitle('🤖 Bot Help')
        .setDescription('Select a category above or use the buttons below:');
    }
    
    // Create navigation buttons
    const row = new ActionRowBuilder();
    
    if (!category) {
      row.addComponents(
        new ButtonBuilder()
          .setCustomId('help-moderation')
          .setLabel('🛡️ Mod')
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId('help-economy')
          .setLabel('💰 Economy')
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId('help-music')
          .setLabel('🎵 Music')
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId('help-utility')
          .setLabel('🔧 Utility')
          .setStyle(ButtonStyle.Secondary)
      );
      
      const row2 = new ActionRowBuilder();
      row2.addComponents(
        new ButtonBuilder()
          .setCustomId('help-tickets')
          .setLabel('🎫 Tickets')
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId('help-game')
          .setLabel('🎮 Games')
          .setStyle(ButtonStyle.Secondary)
      );
      
      await interaction.reply({ embeds: [embed], components: [row, row2] });
    } else {
      await interaction.reply({ embeds: [embed] });
    }
  }
};