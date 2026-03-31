const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

// Profile command - User profile with stats
module.exports = {
  data: new SlashCommandBuilder()
    .setName('profile')
    .setDescription('View your or another user\'s profile')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('User to view')
        .setRequired(false)),
  async execute(interaction, client) {
    const targetUser = interaction.options.getUser('user') || interaction.user;
    const member = interaction.guild.members.cache.get(targetUser.id);
    
    // Get economy balance
    if (!client.economy) client.economy = new Map();
    const balance = client.economy.get(targetUser.id) || 0;
    
    // Get XP
    if (!client.xp) client.xp = new Map();
    const userXP = client.xp.get(targetUser.id) || { xp: 0, level: 1 };
    
    // Get warnings
    let warnings = 0;
    if (client.warnings) {
      const guildWarnings = client.warnings.get(interaction.guild.id) || [];
      warnings = guildWarnings.filter(w => w.userId === targetUser.id).length;
    }
    
    // Get marriages
    let spouse = null;
    if (client.marriages) {
      const marriage = client.marriages.get(targetUser.id);
      if (marriage && marriage.partner) {
        spouse = await interaction.client.users.fetch(marriage.partner).catch(() => null);
      }
    }
    
    const embed = new EmbedBuilder()
      .setTitle('👤 Profile: ' + targetUser.username)
      .setColor(0x3498db)
      .setThumbnail(targetUser.displayAvatarURL())
      .addFields([
        { name: 'ID', value: targetUser.id, inline: true },
        { name: 'Joined', value: member ? member.joinedAt.toLocaleDateString() : 'Unknown', inline: true },
        { name: 'Account Created', value: targetUser.createdAt.toLocaleDateString(), inline: true },
        { name: '💰 Balance', value: String(balance), inline: true },
        { name: '📈 Level', value: String(userXP.level), inline: true },
        { name: '⭐ XP', value: String(userXP.xp), inline: true }
      ]);
    
    if (warnings > 0) {
      embed.addFields([{ name: '⚠️ Warnings', value: String(warnings), inline: true }]);
    }
    
    if (spouse) {
      embed.addFields([{ name: '💍 Spouse', value: spouse.toString(), inline: true }]);
    }
    
    embed.setFooter({ text: 'Discord Member since ' + (member ? member.joinedAt.toLocaleDateString() : 'Unknown') });
    
    await interaction.reply({ embeds: [embed] });
  }
};