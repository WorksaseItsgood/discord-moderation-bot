const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

// Warnings command - view user's warnings
module.exports = {
  data: new SlashCommandBuilder()
    .setName('warnings')
    .setDescription('View a user\'s warnings')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('User to check warnings for')
        .setRequired(true)),
  permissions: [PermissionFlagsBits.ModerateMembers],
  async execute(interaction, client) {
    const user = interaction.options.getUser('user');
    
    const guildWarnings = client.warnings?.get(interaction.guild.id) || [];
    const userWarnings = guildWarnings.filter(w => w.userId === user.id);
    
    if (userWarnings.length === 0) {
      return interaction.reply({
        content: `✅ ${user} has no warnings!`,
        ephemeral: true
      });
    }
    
    const embed = new EmbedBuilder()
      .setTitle(`⚠️ Warnings for ${user.tag}`)
      .setColor(0xffaa00)
      .setDescription(`Total warnings: ${userWarnings.length}`);
    
    for (const warning of userWarnings) {
      const date = new Date(warning.timestamp).toLocaleDateString();
      embed.addFields({
        name: `Warning #${warning.id}`,
        value: `**Reason:** ${warning.reason}\n**By:** ${warning.moderator}\n**Date:** ${date}`,
        inline: false
      });
    }
    
    await interaction.reply({ embeds: [embed] });
  }
};