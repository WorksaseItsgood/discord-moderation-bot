const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

// Report command
module.exports = {
  data: new SlashCommandBuilder()
    .setName('report')
    .setDescription('Report a user')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('User to report')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('Reason for report')
        .setRequired(true)),
  permissions: [],
  async execute(interaction, client) {
    const user = interaction.options.getUser('user');
    const reason = interaction.options.getString('reason');
    const guild = interaction.guild;
    const reporter = interaction.user;
    const db = require('../database');
    
    // Create report
    db.createReport(guild.id, reporter.id, user.id, reason);
    
    // Notify in reports channel
    const reportsChannel = guild.channels.cache.find(ch => ch.name === 'reports');
    
    if (reportsChannel) {
      const embed = new EmbedBuilder()
        .setTitle('🚨 New Report')
        .setColor(0xff0000)
        .addFields(
          { name: 'Reporter', value: reporter.toString(), inline: true },
          { name: 'Reported', value: user.toString(), inline: true },
          { name: 'Reason', value: reason, inline: false }
        )
        .setTimestamp();
      
      await reportsChannel.send({ embeds: [embed] });
    }
    
    await interaction.reply({
      content: `✅ Report submitted for ${user}. Our moderation team will review it.`,
      ephemeral: true
    });
  }
};