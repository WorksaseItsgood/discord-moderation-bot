const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

// Warnpurge command - Remove X warnings from user
module.exports = {
  data: new SlashCommandBuilder()
    .setName('warnpurge')
    .setDescription('Remove X warnings from a user')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('User to remove warnings from')
        .setRequired(true))
    .addIntegerOption(option =>
      option.setName('amount')
        .setDescription('Number of warnings to remove')
        .setRequired(true)
        .setMinValue(1)),
  permissions: [PermissionFlagsBits.ModerateMembers],
  async execute(interaction, client) {
    const user = interaction.options.getUser('user');
    const amount = interaction.options.getInteger('amount');
    
    if (!client.warnings) {
      client.warnings = new Map();
    }
    
    const guildWarnings = client.warnings.get(interaction.guild.id) || [];
    const userWarnings = guildWarnings.filter(w => w.userId === user.id);
    
    if (userWarnings.length === 0) {
      return interaction.reply({ 
        content: `❌ ${user} has no warnings!`,
        ephemeral: true 
      });
    }
    
    if (amount > userWarnings.length) {
      return interaction.reply({ 
        content: `❌ ${user} only has ${userWarnings.length} warning(s). You requested to remove ${amount}.`,
        ephemeral: true 
      });
    }
    
    // Remove the oldest warnings (first in the array)
    const remainingWarnings = guildWarnings.filter(w => w.userId !== user.id);
    const warningsToRemove = userWarnings.slice(0, amount);
    const newUserWarnings = userWarnings.slice(amount);
    
    // Combine remaining with new user warnings
    const finalWarnings = [...remainingWarnings, ...newUserWarnings];
    client.warnings.set(interaction.guild.id, finalWarnings);
    
    const embed = new EmbedBuilder()
      .setTitle('🗑️ Warnings Removed')
      .setColor(0x00ff00)
      .addFields(
        { name: 'User', value: `${user} (${user.id})`, inline: true },
        { name: 'Removed', value: String(amount), inline: true },
        { name: 'Remaining', value: String(newUserWarnings.length), inline: true }
      )
      .setFooter({ text: `Removed by ${interaction.user.tag}` });
    
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