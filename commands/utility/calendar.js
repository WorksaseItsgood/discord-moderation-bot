/**
 * Calendar Command
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('calendar')
    .setDescription('View or manage calendar')
    .addStringOption(option => option.setName('action').setDescription('Action')
      .addChoices(
        { name: 'View', value: 'view' },
        { name: 'Add', value: 'add' },
        { name: 'Remove', value: 'remove' }
      ).setRequired(false)),
  
  async execute(interaction, client) {
    const embed = new EmbedBuilder()
      .setTitle('📆 Calendar')
      .setDescription('Upcoming events:\n• Event1 - Friday\n• Event2 - Saturday\n• Event3 - Sunday')
      .setColor(0x00ff00);
    
    await interaction.reply({ embeds: [embed] });
  }
};