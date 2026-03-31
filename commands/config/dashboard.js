const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

// Dashboard command - Server config dashboard
module.exports = {
  data: new SlashCommandBuilder()
    .setName('dashboard')
    .setDescription('View server configuration dashboard'),
  permissions: [PermissionFlagsBits.ManageGuild],
  async execute(interaction, client) {
    const guild = interaction.guild;
    
    // Gather config
    let welcomeChannel = guild.channels.cache.find(ch => ch.name === 'welcome');
    let modLogChannel = guild.channels.cache.find(ch => ch.name === 'mod-logs');
    let autoModEnabled = client.automodConfig ? client.automodConfig.get(guild.id) : null;
    let antiraidEnabled = client.antiRaidConfig ? client.antiRaidConfig.get(guild.id) : null;
    
    const embed = new EmbedBuilder()
      .setTitle('📊 Server Dashboard: ' + guild.name)
      .setColor(0x3498db)
      .setThumbnail(guild.iconURL())
      .addFields([
        { name: '📋 Server Info', value: 'Members: ' + guild.memberCount + '\nChannels: ' + guild.channels.cache.size + '\nRoles: ' + guild.roles.cache.size, inline: true },
        { name: '👋 Welcome Channel', value: welcomeChannel ? welcomeChannel.toString() : 'Not set', inline: true },
        { name: '⚠️ Mod Log Channel', value: modLogChannel ? modLogChannel.toString() : 'Not set', inline: true },
        { name: '🛡️ AutoMod', value: autoModEnabled ? 'Enabled' : 'Disabled', inline: true },
        { name: '🚨 Anti-Raid', value: antiraidEnabled ? 'Enabled' : 'Disabled', inline: true }
      ])
      .setFooter({ text: 'Use /config to change settings' });
    
    await interaction.reply({ embeds: [embed] });
  }
};