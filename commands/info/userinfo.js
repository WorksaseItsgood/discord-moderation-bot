const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

// Userinfo command
module.exports = {
  data: new SlashCommandBuilder()
    .setName('userinfo')
    .setDescription('Get user information')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('User to check')
        .setRequired(false)),
  permissions: [],
  async execute(interaction, client) {
    const user = interaction.options.getUser('user') || interaction.user;
    const member = interaction.guild.members.cache.get(user.id);
    const db = require('../database');
    
    const userData = db.getUser(user.id, interaction.guild.id);
    
    const embed = new EmbedBuilder()
      .setTitle(`👤 ${user.username}'s User Info`)
      .setColor(0x00ff00)
      .setThumbnail(user.displayAvatarURL())
      .addFields(
        { name: 'Username', value: user.toString(), inline: true },
        { name: 'ID', value: user.id, inline: true },
        { name: 'Bot', value: user.bot ? '🤖 Yes' : '👤 No', inline: true },
        { name: 'Account Created', value: user.createdAt.toLocaleDateString(), inline: true },
        { name: 'Joined Server', value: member?.joinedAt?.toLocaleDateString() || 'Unknown', inline: true },
        { name: 'Roles', value: member?.roles?.cache?.map(r => r.name).filter(n => n !== '@everyone').join(', ') || 'None', inline: false }
      );
    
    if (userData) {
      embed.addFields(
        { name: 'Level', value: `${userData.level}`, inline: true },
        { name: 'XP', value: `${userData.xp}`, inline: true },
        { name: 'Coins', value: `${userData.coins} 🪙`, inline: true }
      );
    }
    
    await interaction.reply({ embeds: [embed] });
  }
};