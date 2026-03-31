/**
 * Schedule Command
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('schedule')
    .setDescription('Schedule an event')
    .addStringOption(option => option.setName('event').setDescription('Event name').setRequired(true))
    .addStringOption(option => option.setName('date').setDescription('Date and time').setRequired(true)),
  
  async execute(interaction, client) {
    const event = interaction.options.getString('event');
    const date = interaction.options.getString('date');
    
    await interaction.reply({ content: `📅 Scheduled: ${event} at ${date}` });
  }
};