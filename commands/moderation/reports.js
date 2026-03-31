const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

// Reports command - view all reports
module.exports = {
  data: new SlashCommandBuilder()
    .setName('reports')
    .setDescription('View all reports')
    .addIntegerOption(option =>
      option.setName('page')
        .setDescription('Page number')
        .setMinValue(1)
        .setRequired(false)),
  permissions: [PermissionFlagsBits.ModerateMembers],
  async execute(interaction, client) {
    const page = interaction.options.getInteger('page') || 1;
    const reportsPerPage = 10;
    
    // Get reports from storage
    const allReports = client.reports || [];
    const guildReports = allReports.filter(r => r.guildId === interaction.guild.id);
    
    if (guildReports.length === 0) {
      return interaction.reply({ 
        content: '📋 No reports found.',
        ephemeral: true 
      });
    }
    
    const totalPages = Math.ceil(guildReports.length / reportsPerPage);
    const start = (page - 1) * reportsPerPage;
    const end = start + reportsPerPage;
    const pageReports = guildReports.slice(start, end);
    
    const embed = new EmbedBuilder()
      .setTitle('📋 Reports')
      .setColor(0x0099ff)
      .setDescription(`Page ${page}/${totalPages}`);
    
    for (const report of pageReports) {
      const status = report.resolved ? '✅ Resolved' : '⏳ Open';
      
      embed.addFields({
        name: `Report #${report.id} - ${status}`,
        value: `Reporter: ${report.reporter}\nReported: ${report.reported}\nReason: ${report.reason}\nTime: <t:${Math.floor(report.timestamp / 1000)}:f>`
      });
    }
    
    await interaction.reply({ embeds: [embed] });
  }
};