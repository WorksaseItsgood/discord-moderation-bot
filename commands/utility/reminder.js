/**
 * Reminder Command
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('reminder')
    .setDescription('Set a reminder')
    .addStringOption(option => option.setName('message').setDescription('Reminder message').setRequired(true))
    .addStringOption(option => option.setName('time').setDescription('Time (e.g., 1h, 30m)').setRequired(true)),
  
  async execute(interaction, client) {
    const message = interaction.options.getString('message');
    const time = interaction.options.getString('time');
    
    await interaction.reply({ content: `⏰ Reminder set for ${time}: "${message}"` });
  }
};