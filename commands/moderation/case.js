/**
 * Case System Command
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('case')
    .setDescription('View or manage a case')
    .addIntegerOption(option => option.setName('caseid').setDescription('Case ID').setRequired(false)),
  
  async execute(interaction, client) {
    const caseId = interaction.options.getInteger('caseid');
    
    const embed = new EmbedBuilder()
      .setTitle('📁 Case View')
      .setDescription(caseId ? `Case #${caseId}\n• User: Example#1234\n• Action: Warn\n• Reason: Spam\n• Moderator: Admin\n• Date: Today`)
      .setColor(0x0000ff);
    
    await interaction.reply({ embeds: [embed] });
  }
};