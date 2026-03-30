const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');

// Help command - show help menu
module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Show help menu')
    .addStringOption(option =>
      option.setName('category')
        .setDescription('Category to show help for')
        .setRequired(false)
        .addChoices(
          { name: 'Moderation', value: 'moderation' },
          { name: 'Economy', value: 'economy' },
          { name: 'Tickets', value: 'tickets' },
          { name: 'Info', value: 'info' }
        )),
  permissions: [],
  async execute(interaction, client) {
    const category = interaction.options.getString('category');
    const guildId = interaction.guild?.id;
    
    const categories = {
      moderation: {
        title: '🔨 Moderation Commands',
        commands: [
          '/ban - Ban a user',
          '/unban - Unban a user',
          '/kick - Kick a user',
          '/mute - Mute a user',
          '/unmute - Unmute a user',
          '/warn - Warn a user',
          '/warnings - View warnings',
          '/clearwarns - Clear warnings',
          '/lock - Lock channel',
          '/unlock - Unlock channel',
          '/slowmode - Set slowmode',
          '/purge - Delete messages',
          '/role - Add/remove role',
          '/voicemute - Voice mute',
          '/deafen - Deafen user',
          '/disconnect - Disconnect from voice',
          '/lockdown - Lock all channels',
          '/unraid - Unlock all channels'
        ]
      },
      economy: {
        title: '💰 Economy Commands',
        commands: [
          '/daily - Claim daily reward',
          '/balance - Check balance',
          '/pay - Pay coins',
          '/leaderboard - View leaderboard',
          '/rank - View rank card'
        ]
      },
      tickets: {
        title: '🎫 Ticket Commands',
        commands: [
          '/ticket - Create ticket',
          '/ticketpanel - Create ticket panel'
        ]
      },
      info: {
        title: 'ℹ️ Info Commands',
        commands: [
          '/ping - Check bot latency',
          '/serverstats - Server statistics',
          '/serverinfo - Server info',
          '/userinfo - User info',
          '/invite - Get invite link',
          '/help - Show this help'
        ]
      }
    };
    
    if (category) {
      const cat = categories[category];
      const embed = new EmbedBuilder()
        .setTitle(cat.title)
        .setColor(0x00ff00)
        .setDescription(cat.commands.join('\n'));
      
      await interaction.reply({ embeds: [embed], ephemeral: true });
    } else {
      // Show all categories
      const embed = new EmbedBuilder()
        .setTitle('🤖 Bot Help')
        .setColor(0x00ff00)
        .setDescription('Available command categories:')
        .addFields(
          { name: '🔨 Moderation', value: '`/help moderation`', inline: true },
          { name: '💰 Economy', value: '`/help economy`', inline: true },
          { name: '🎫 Tickets', value: '`/help tickets`', inline: true },
          { name: 'ℹ️ Info', value: '`/help info`', inline: true }
        ));
      
      await interaction.reply({ embeds: [embed], ephemeral: true });
    }
  }
};