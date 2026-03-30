const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

// Clearwarns command - clear all warnings for a user
module.exports = {
  data: new SlashCommandBuilder()
    .setName('clearwarns')
    .setDescription('Clear all warnings for a user')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('User to clear warnings for')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('Reason for clearing warnings')
        .setRequired(false)),
  permissions: [PermissionFlagsBits.ModerateMembers],
  async execute(interaction, client) {
    const user = interaction.options.getUser('user');
    const reason = interaction.options.getString('reason') || 'No reason provided';
    
    const guildWarnings = client.warnings?.get(interaction.guild.id) || [];
    const userWarnings = guildWarnings.filter(w => w.userId === user.id);
    const warningCount = userWarnings.length;
    
    if (warningCount === 0) {
      return interaction.reply({
        content: `✅ ${user} has no warnings to clear!`,
        ephemeral: true
      });
    }
    
    // Remove user's warnings
    const updatedWarnings = guildWarnings.filter(w => w.userId !== user.id);
    client.warnings.set(interaction.guild.id, updatedWarnings);
    
    console.log(`[Clearwarns] Cleared ${warningCount} warnings for ${user.tag} in ${interaction.guild.name}`);
    
    const embed = new EmbedBuilder()
      .setTitle('✅ Warnings Cleared')
      .setColor(0x00ff00)
      .addFields(
        { name: 'User', value: `${user} (${user.id})`, inline: true },
        { name: 'Warnings Cleared', value: String(warningCount), inline: true },
        { name: 'Reason', value: reason, inline: true }
      ));
    
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