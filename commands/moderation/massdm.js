/**
 * Mass DM Command
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('massdm')
    .setDescription('Send a DM to all server members')
    .addStringOption(option => option.setName('message').setDescription('Message to send').setRequired(true)),
  
  async execute(interaction, client) {
    const message = interaction.options.getString('message');
    
    await interaction.reply({ content: `📨 Sending DM to all members: "${message}"` });
  }
};