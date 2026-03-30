const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

// Kick command
module.exports = {
  data: new SlashCommandBuilder()
    .setName('kick')
    .setDescription('Kick a user from the server')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('User to kick')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('Reason for kick')
        .setRequired(false))
    .addBooleanOption(option =>
      option.setName('dm')
        .setDescription('DM the user about the kick')
        .setRequired(false)
        .setDefault(true)),
  permissions: [PermissionFlagsBits.KickMembers],
  async execute(interaction, client) {
    const user = interaction.options.getUser('user');
    const reason = interaction.options.getString('reason') || 'No reason provided';
    const dm = interaction.options.getBoolean('dm') ?? true;
    
    const member = interaction.guild.members.cache.get(user.id);
    const guildConfig = require('../config').defaultConfig;
    const dmOnAction = guildConfig.moderation?.dmOnAction ?? true;
    
    // Check if user is kickable
    if (member) {
      if (!member.kickable) {
        return interaction.reply({
          content: '❌ I cannot kick this user! They may have higher permissions than me.',
          ephemeral: true
        });
      }
    }
    
    // Build DM embed
    const dmEmbed = new EmbedBuilder()
      .setTitle('👢 You have been kicked')
      .setColor(0xffaa00)
      .addFields(
        { name: 'Server', value: interaction.guild.name },
        { name: 'Reason', value: reason }
      );
    
    // Try to DM user
    if (dm && dmOnAction) {
      try {
        await user.send({ embeds: [dmEmbed] });
      } catch (error) {
        console.log(`[Kick] Could not DM user ${user.tag}:`, error.message);
      }
    }
    
    // Kick the user
    try {
      await member.kick(reason);
    } catch (error) {
      return interaction.reply({
        content: `❌ Error kicking user: ${error.message}`,
        ephemeral: true
      });
    }
    
    console.log(`[Kick] ${user.tag} (${user.id}) kicked from ${interaction.guild.name}. Reason: ${reason}`);
    
    const embed = new EmbedBuilder()
      .setTitle('👢 User Kicked')
      .setColor(0xffaa00)
      .addFields(
        { name: 'User', value: `${user} (${user.id})`, inline: true },
        { name: 'Reason', value: reason, inline: true }
      ));
    
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