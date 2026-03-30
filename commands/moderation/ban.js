const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

// Ban command
module.exports = {
  data: new SlashCommandBuilder()
    .setName('ban')
    .setDescription('Ban a user from the server')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('User to ban')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('Reason for ban')
        .setRequired(false))
    .addStringOption(option =>
      option.setName('duration')
        .setDescription('Ban duration (e.g., 7d, 24h, 30m) - leave empty for permanent')
        .setRequired(false))
    .addBooleanOption(option =>
      option.setName('dm')
        .setDescription('DM the user about the ban')
        .setRequired(false)
        .setDefault(true)),
  permissions: [PermissionFlagsBits.BanMembers],
  async execute(interaction, client) {
    const user = interaction.options.getUser('user');
    const reason = interaction.options.getString('reason') || 'No reason provided';
    const duration = interaction.options.getString('duration');
    const dm = interaction.options.getBoolean('dm') ?? true;
    
    const member = interaction.guild.members.cache.get(user.id);
    const guildConfig = require('../config').defaultConfig;
    const dmOnAction = guildConfig.moderation?.dmOnAction ?? true;
    
    // Calculate ban duration in milliseconds
    let banDurationMs = null;
    if (duration) {
      const durationMatch = duration.match(/^(\d+)([dhms])$/i);
      if (durationMatch) {
        const value = parseInt(durationMatch[1]);
        const unit = durationMatch[2].toLowerCase();
        const multipliers = { d: 86400000, h: 3600000, m: 60000, s: 1000 };
        banDurationMs = value * multipliers[unit];
      }
    }
    
    // Check if user is banable
    if (member) {
      if (!member.bannable) {
        return interaction.reply({
          content: '❌ I cannot ban this user! They may have higher permissions than me.',
          ephemeral: true
        });
      }
    }
    
    // Build DM embed
    const dmEmbed = new EmbedBuilder()
      .setTitle('🔨 You have been banned')
      .setColor(0xff0000)
      .addFields(
        { name: 'Server', value: interaction.guild.name },
        { name: 'Reason', value: reason }
      );
    
    if (banDurationMs) {
      dmEmbed.addFields({ name: 'Duration', value: duration });
    }
    
    // Try to DM user
    if (dm && dmOnAction) {
      try {
        await user.send({ embeds: [dmEmbed] });
      } catch (error) {
        console.log(`[Ban] Could not DM user ${user.tag}:`, error.message);
      }
    }
    
    // Ban the user
    try {
      const banOptions = {
        reason: `${reason}${banDurationMs ? ` (Temp ban: ${duration})` : ''}`
      };
      
      if (banDurationMs) {
        // For temporary bans, we need to store the ban info
        // Discord.js doesn't natively support temp bans, so we ban now and schedule unban
        await interaction.guild.bans.create(user.id, banOptions);
        
        // Store temp ban info
        if (!client.tempBans) client.tempBans = new Map();
        client.tempBans.set(user.id, {
          guildId: interaction.guild.id,
          unbanAt: Date.now() + banDurationMs
        });
        
        // Schedule unban
        setTimeout(async () => {
          try {
            await interaction.guild.bans.remove(user.id, 'Temporary ban expired');
            client.tempBans.delete(user.id);
            console.log(`[Ban] Temporary ban expired for ${user.tag}`);
          } catch (error) {
            console.error(`[Ban] Error unbanning ${user.tag}:`, error);
          }
        }, banDurationMs);
      } else {
        await interaction.guild.bans.create(user.id, banOptions);
      }
    } catch (error) {
      return interaction.reply({
        content: `❌ Error banning user: ${error.message}`,
        ephemeral: true
      });
    }
    
    // Log the ban
    console.log(`[Ban] ${user.tag} (${user.id}) banned in ${interaction.guild.name}. Reason: ${reason}`);
    
    // Reply to moderator
    const embed = new EmbedBuilder()
      .setTitle('🔨 User Banned')
      .setColor(0xff0000)
      .addFields(
        { name: 'User', value: `${user} (${user.id})`, inline: true },
        { name: 'Reason', value: reason, inline: true }
      ));
    
    if (duration) {
      embed.addFields({ name: 'Duration', value: duration, inline: true });
    }
    
    embed.addFields({ name: 'DM Sent', value: dm && dmOnAction ? '✅' : '❌' });
    
    await interaction.reply({ embeds: [embed] });
    
    // Log to mod log channel
    const logChannel = interaction.guild.channels.cache.find(ch => 
      ch.name === 'mod-logs' || ch.name === 'moderation-logs'
    );
    
    if (logChannel) {
      await logChannel.send({ embeds: [embed] });
    }
  }
};