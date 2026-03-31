const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

// Leaderboard command - Extended economy leaderboard
module.exports = {
  data: new SlashCommandBuilder()
    .setName('leaderboard')
    .setDescription('View the server leaderboard')
    .addStringOption(option =>
      option.setName('type')
        .setDescription('Leaderboard type (balance, xp, warnings)')
        .setRequired(false)),
  async execute(interaction, client) {
    const type = interaction.options.getString('type') || 'balance';
    
    let leaderboard = [];
    
    if (type === 'balance') {
      if (!client.economy) client.economy = new Map();
      for (const [userId, balance] of client.economy) {
        const user = await interaction.client.users.fetch(userId).catch(() => null);
        if (user) leaderboard.push({ user, balance });
      }
      leaderboard.sort((a, b) => b.balance - a.balance);
    } else if (type === 'xp') {
      if (!client.xp) client.xp = new Map();
      for (const [userId, data] of client.xp) {
        const user = await interaction.client.users.fetch(userId).catch(() => null);
        if (user) leaderboard.push({ user, xp: data.xp, level: data.level });
      }
      leaderboard.sort((a, b) => b.xp - a.xp);
    } else if (type === 'warnings') {
      if (!client.warnings) client.warnings = new Map();
      const guildWarnings = client.warnings.get(interaction.guild.id) || [];
      const warningCounts = {};
      for (const w of guildWarnings) {
        warningCounts[w.userId] = (warningCounts[w.userId] || 0) + 1;
      }
      for (const [userId, count] of Object.entries(warningCounts)) {
        const user = await interaction.client.users.fetch(userId).catch(() => null);
        if (user) leaderboard.push({ user, count });
      }
      leaderboard.sort((a, b) => b.count - a.count);
    }
    
    if (leaderboard.length === 0) {
      return interaction.reply({ content: 'No data yet!', ephemeral: true });
    }
    
    const top10 = leaderboard.slice(0, 10);
    let description = '';
    for (let i = 0; i < top10.length; i++) {
      const entry = top10[i];
      description += (i + 1) + '. ' + entry.user.username + ' - ' + (entry.balance || entry.xp || entry.count) + '\n';
    }
    
    const typeNames = { balance: 'Balance', xp: 'XP', warnings: 'Warnings' };
    const embed = new EmbedBuilder()
      .setTitle(typeNames[type] + ' Leaderboard')
      .setColor(0xffd700)
      .setDescription(description);
    
    await interaction.reply({ embeds: [embed] });
  }
};