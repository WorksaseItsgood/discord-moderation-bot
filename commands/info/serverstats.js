const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

// Stats command - view server stats
module.exports = {
  data: new SlashCommandBuilder()
    .setName('serverstats')
    .setDescription('View server statistics')
    .addIntegerOption(option =>
      option.setName('days')
        .setDescription('Number of days to show')
        .setMinValue(1)
        .setMaxValue(30)
        .setRequired(false)),
  permissions: [],
  async execute(interaction, client) {
    const days = interaction.options.getInteger('days') || 7;
    const guild = interaction.guild;
    const db = require('../database');
    
    // Get current stats
    const memberCount = guild.memberCount;
    const channelCount = guild.channels.cache.size;
    const roleCount = guild.roles.cache.size;
    const emojiCount = guild.emojis.cache.size;
    
    // Get bot stats
    const botCount = guild.members.cache.filter(m => m.user.bot).size;
    const humanCount = memberCount - botCount;
    
    // Get stats history
    const history = db.getServerStats(guild.id, days);
    
    let growth = 'N/A';
    if (history.length > 1) {
      const first = history[history.length - 1];
      const last = history[0];
      growth = last.member_count - first.member_count;
      growth = growth > 0 ? `+${growth}` : growth;
    }
    
    const embed = new EmbedBuilder()
      .setTitle(`📊 ${guild.name} Statistics`)
      .setColor(0x00ff00)
      .setThumbnail(guild.iconURL())
      .addFields(
        { name: 'Members', value: `${memberCount}`, inline: true },
        { name: 'Humans', value: `${humanCount}`, inline: true },
        { name: 'Bots', value: `${botCount}`, inline: true },
        { name: 'Channels', value: `${channelCount}`, inline: true },
        { name: 'Roles', value: `${roleCount}`, inline: true },
        { name: 'Emojis', value: `${emojiCount}`, inline: true },
        { name: 'Growth (7d)', value: growth, inline: true },
        { name: 'Created', value: guild.createdAt.toLocaleDateString(), inline: true }
      ));
    
    await interaction.reply({ embeds: [embed] });
  }
};