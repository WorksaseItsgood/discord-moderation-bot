/**
 * Remindme Command
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('remindme')
    .setDescription('Remind yourself something')
    .addStringOption(option => option.setName('message').setDescription('What to remind').setRequired(true))
    .addStringOption(option => option.setName('time').setDescription('When to remind').setRequired(true)),
  
  async execute(interaction, client) {
    const message = interaction.options.getString('message');
    const time = interaction.options.getString('time');
    
    await interaction.reply({ content: `🔔 I'll remind you "${message}" in ${time}!` });
  }
};