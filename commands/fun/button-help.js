const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

const categories = {
  moderation: {
    name: '🛡️ Moderation',
    emoji: '🛡️',
    commands: [
      { name: 'ban', desc: 'Ban a user from the server' },
      { name: 'unban', desc: 'Unban a user' },
      { name: 'kick', desc: 'Kick a user from the server' },
      { name: 'mute', desc: 'Mute a user' },
      { name: 'unmute', desc: 'Unmute a user' },
      { name: 'warn', desc: 'Warn a user' },
      { name: 'warnings', desc: 'View all warnings' },
      { name: 'clearwarns', desc: 'Clear a user\'s warnings' },
      { name: 'lock', desc: 'Lock a channel' },
      { name: 'unlock', desc: 'Unlock a channel' },
      { name: 'slowmode', desc: 'Set slowmode' }
    ],
    color: 0xE74C3C
  },
  fun: {
    name: '🎮 Fun',
    emoji: '🎮',
    commands: [
      { name: 'meme', desc: 'Get a random meme' },
      { name: 'joke', desc: 'Get a random joke' },
      { name: '8ball', desc: 'Ask the magic 8ball' },
      { name: 'riddle', desc: 'Get a riddle to solve' },
      { name: 'roast', desc: 'Roast someone' },
      { name: 'slots', desc: 'Play the slot machine' },
      { name: 'trivia', desc: 'Play trivia' }
    ],
    color: 0xFEE75C
  },
  economy: {
    name: '💰 Economy',
    emoji: '💰',
    commands: [
      { name: 'balance', desc: 'Check your balance' },
      { name: 'daily', desc: 'Claim daily rewards' },
      { name: 'beg', desc: 'Beg for money' },
      { name: 'shop', desc: 'View the shop' },
      { name: 'buy', desc: 'Buy an item' }
    ],
    color: 0x57F287
  },
  utility: {
    name: '🔧 Utility',
    emoji: '🔧',
    commands: [
      { name: 'ping', desc: 'Check bot ping' },
      { name: 'avatar', desc: 'Get user avatar' },
      { name: 'serverinfo', desc: 'Get server info' },
      { name: 'userinfo', desc: 'Get user info' },
      { name: 'roleinfo', desc: 'Get role info' },
      { name: 'poll', desc: 'Create a poll' }
    ],
    color: 0x5865F2
  },
  info: {
    name: '📋 Info',
    emoji: '📋',
    commands: [
      { name: 'help', desc: 'Show help menu' },
      { name: 'botinfo', desc: 'Get bot information' },
      { name: 'stats', desc: 'Get bot stats' }
    ],
    color: 0x2F3136
  }
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName('button-help')
    .setDescription('Show help menu with button navigation'),
  async execute(interaction, client) {
    const categoryKeys = Object.keys(categories);
    
    function buildButtons(currentIndex) {
      const row = new ActionRowBuilder();
      
      row.addComponents(
        new ButtonBuilder()
          .setCustomId('help_prev')
          .setLabel('◀')
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(currentIndex === 0),
        new ButtonBuilder()
          .setCustomId('help_home')
          .setLabel('🏠')
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomIdId('help_next')
          .setLabel('▶')
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(currentIndex === categoryKeys.length - 1)
      );
      
      return row;
    }
    
    function buildCategoryButtons() {
      const row = new ActionRowBuilder();
      
      for (const [key, cat] of Object.entries(categories)) {
        row.addComponents(
          new ButtonBuilder()
            .setCustomId(`help_cat_${key}`)
            .setLabel(cat.emoji + ' ' + cat.name.replace(/^[^\s]+ /, ''))
            .setStyle(ButtonStyle.Secondary)
        );
      }
      
      return row;
    }
    
    const mainEmbed = new EmbedBuilder()
      .setColor(0x2F3136)
      .setTitle('📚 Help Menu')
      .setDescription('Use the buttons below to navigate between categories!\n\n' + 
        Object.values(categories).map(c => `${c.emoji} **${c.name.replace(/^[^\s]+ /, '')}** - ${c.commands.length} commands`).join('\n'))
      .setFooter({ text: 'Niotic Moderation • Use /help <command> for details' })
      .setTimestamp();
    
    const categoryRows = Object.keys(categories).map((_, i) => {
      const row = new ActionRowBuilder();
      const cats = Object.entries(categories);
      
      if (i === 0) {
        row.addComponents(
          new ButtonBuilder()
            .setCustomId('help_mod')
            .setLabel('🛡️ Mod')
            .setStyle(ButtonStyle.Secondary),
          new ButtonBuilder()
            .setCustomId('help_fun')
            .setLabel('🎮 Fun')
            .setStyle(ButtonStyle.Secondary),
          new ButtonBuilder()
            .setCustomId('help_econ')
            .setLabel('💰 Economy')
            .setStyle(ButtonStyle.Secondary),
          new ButtonBuilder()
            .setCustomId('help_util')
            .setLabel('🔧 Utility')
            .setStyle(ButtonStyle.Secondary),
          new ButtonBuilder()
            .setCustomId('help_info')
            .setLabel('📋 Info')
            .setStyle(ButtonStyle.Secondary)
        );
      }
      return row;
    });
    
    await interaction.reply({ embeds: [mainEmbed], components: [categoryRows[0]], ephemeral: true });
    
    const message = await interaction.fetchReply();
    
    const collector = message.createMessageComponentCollector({
      componentType: ButtonStyle.Secondary,
      time: 60000
    });
    
    collector.on('collect', async (buttonInteraction) => {
      const customId = buttonInteraction.customId;
      
      if (customId.startsWith('help_mod')) {
        const cat = categories.moderation;
        const embed = new EmbedBuilder()
          .setColor(cat.color)
          .setTitle(cat.name)
          .setDescription('Here are all the commands in this category:\n\n' +
            cat.commands.map(c => `**/${c.name}** - ${c.desc}`).join('\n'))
          .setFooter({ text: 'Niotic Moderation' });
        
        await buttonInteraction.update({ embeds: [embed] });
      } else if (customId.startsWith('help_fun')) {
        const cat = categories.fun;
        const embed = new EmbedBuilder()
          .setColor(cat.color)
          .setTitle(cat.name)
          .setDescription('Here are all the commands in this category:\n\n' +
            cat.commands.map(c => `**/${c.name}** - ${c.desc}`).join('\n'))
          .setFooter({ text: 'Niotic Moderation' });
        
        await buttonInteraction.update({ embeds: [embed] });
      } else if (customId.startsWith('help_econ')) {
        const cat = categories.economy;
        const embed = new EmbedBuilder()
          .setColor(cat.color)
          .setTitle(cat.name)
          .setDescription('Here are all the commands in this category:\n\n' +
            cat.commands.map(c => `**/${c.name}** - ${c.desc}`).join('\n'))
          .setFooter({ text: 'Niotic Moderation' });
        
        await buttonInteraction.update({ embeds: [embed] });
      } else if (customId.startsWith('help_util')) {
        const cat = categories.utility;
        const embed = new EmbedBuilder()
          .setColor(cat.color)
          .setTitle(cat.name)
          .setDescription('Here are all the commands in this category:\n\n' +
            cat.commands.map(c => `**/${c.name}** - ${c.desc}`).join('\n'))
          .setFooter({ text: 'Niotic Moderation' });
        
        await buttonInteraction.update({ embeds: [embed] });
      } else if (customId.startsWith('help_info')) {
        const cat = categories.info;
        const embed = new EmbedBuilder()
          .setColor(cat.color)
          .setTitle(cat.name)
          .setDescription('Here are all the commands in this category:\n\n' +
            cat.commands.map(c => `**/${c.name}** - ${c.desc}`).join('\n'))
          .setFooter({ text: 'Niotic Moderation' });
        
        await buttonInteraction.update({ embeds: [embed] });
      } else if (customId === 'help_home') {
        await buttonInteraction.update({ embeds: [mainEmbed], components: [categoryRows[0]] });
      }
    });
  }
};