const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

// Stalk command - Stalk a user's profile
module.exports = {
  data: new SlashCommandBuilder()
    .setName('stalk')
    .setDescription('Get detailed info about a user')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('User to stalk')
        .setRequired(false)),
  async execute(interaction, client) {
    const user = interaction.options.getUser('user') || interaction.user;
    const member = interaction.guild.members.cache.get(user.id);
    
    // Get all data
    if (!client.economy) client.economy = new Map();
    const balance = client.economy.get(user.id) || 0;
    
    if (!client.xp) client.xp = new Map();
    const userXP = client.xp.get(user.id) || { xp: 0, level: 1 };
    
    if (!client.reputation) client.reputation = new Map();
    const rep = client.reputation.get(user.id) || 0;
    
    if (!client.marriages) client.marriages = new Map();
    let spouse = null;
    const marriage = client.marriages.get(user.id);
    if (marriage && marriage.partner) {
      spouse = await interaction.client.users.fetch(marriage.partner).catch(() => null);
    }
    
    const embed = new EmbedBuilder()
      .setTitle('🔍 Stalking: ' + user.username)
      .setColor(0x2c3e50)
      .setThumbnail(user.displayAvatarURL())
      .addFields([
        { name: 'ID', value: user.id, inline: true },
        { name: 'Account Created', value: user.createdAt.toLocaleDateString(), inline: true },
        { name: 'Server Joined', value: member ? member.joinedAt.toLocaleDateString() : 'Unknown', inline: true },
        { name: '💰 Balance', value: String(balance), inline: true },
        { name: '⭐ XP', value: String(userXP.xp), inline: true },
        { name: '📈 Level', value: String(userXP.level), inline: true },
        { name: '👍 Reputation', value: String(rep), inline: true }
      ]);
    
    if (spouse) {
      embed.addFields([{ name: '💍 Spouse', value: spouse.toString(), inline: true }]);
    }
    
    await interaction.reply({ embeds: [embed] });
  }
};