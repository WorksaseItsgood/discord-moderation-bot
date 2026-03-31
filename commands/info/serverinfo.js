const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

// Serverinfo command
module.exports = {
  data: new SlashCommandBuilder()
    .setName('serverinfo')
    .setDescription('Get server information'),
  permissions: [],
  async execute(interaction, client) {
    const guild = interaction.guild;
    
    const embed = new EmbedBuilder()
      .setTitle(`🏛️ ${guild.name}`)
      .setColor(0x00ff00)
      .setThumbnail(guild.iconURL())
      .addFields(
        { name: 'Server ID', value: guild.id, inline: true },
        { name: 'Owner', value: `<@${guild.ownerId}>`, inline: true },
        { name: 'Created', value: guild.createdAt.toLocaleDateString(), inline: true },
        { name: 'Members', value: `${guild.memberCount}`, inline: true },
        { name: 'Channels', value: `${guild.channels.cache.size}`, inline: true },
        { name: 'Roles', value: `${guild.roles.cache.size}`, inline: true },
        { name: 'Emojis', value: `${guild.emojis.cache.size}`, inline: true },
        { name: 'Verification', value: verificationLevel(guild.verificationLevel), inline: true },
        { name: ' nitro', value: guild.premiumTier === 0 ? 'None' : `Tier ${guild.premiumTier}`, inline: true }
      );
    
    await interaction.reply({ embeds: [embed] });
  }
};

function verificationLevel(level) {
  const levels = {
    0: 'None',
    1: 'Low',
    2: 'Medium',
    3: 'High',
    4: 'Very High'
  };
  return levels[level] || 'Unknown';
}