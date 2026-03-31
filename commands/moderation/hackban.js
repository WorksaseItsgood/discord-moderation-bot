const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

// Hackban command - Ban user by ID not in server
module.exports = {
  data: new SlashCommandBuilder()
    .setName('hackban')
    .setDescription('Ban a user by ID (even if not in the server)')
    .addStringOption(option =>
      option.setName('userid')
        .setDescription('User ID to ban')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('Reason for ban')
        .setRequired(false)),
  permissions: [PermissionFlagsBits.BanMembers],
  async execute(interaction, client) {
    const userId = interaction.options.getString('userid');
    const reason = interaction.options.getString('reason') || 'No reason provided';
    
    // Validate ID format
    if (isNaN(userId) || userId.length < 17 || userId.length > 19) {
      return interaction.reply({ 
        content: '❌ Invalid user ID format!',
        ephemeral: true 
      });
    }
    
    // Check if already banned
    const existingBan = await interaction.guild.bans.fetch(userId).catch(() => null);
    if (existingBan) {
      return interaction.reply({ 
        content: '❌ User is already banned!',
        ephemeral: true 
      });
    }
    
    try {
      // Try to fetch the user
      let user;
      try {
        user = await client.users.fetch(userId);
      } catch (e) {
        user = { id: userId, tag: `Unknown#0000 (${userId})`, toString: () => userId };
      }
      
      // Ban the user
      await interaction.guild.bans.create(userId, {
        reason: `Hackban: ${reason}`
      });
      
      const embed = new EmbedBuilder()
        .setTitle('🔨 Hackban Complete')
        .setColor(0xff0000)
        .addFields(
          { name: 'User ID', value: userId, inline: true },
          { name: 'User Tag', value: user.tag || 'Unknown', inline: true },
          { name: 'Reason', value: reason, inline: true }
        )
        .setFooter({ text: `Banned by ${interaction.user.tag}` });
      
      await interaction.reply({ embeds: [embed] });
      
      // Log to mod log
      const logChannel = interaction.guild.channels.cache.find(ch => 
        ch.name === 'mod-logs' || ch.name === 'moderation-logs'
      );
      
      if (logChannel) {
        await logChannel.send({ embeds: [embed] });
      }
      
    } catch (error) {
      await interaction.reply({ 
        content: `❌ Error: ${error.message}`,
        ephemeral: true 
      });
    }
  }
};