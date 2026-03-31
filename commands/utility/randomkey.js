/**
 * Random Key Command
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('randomkey')
    .setDescription('Generate a random API key'),
  
  async execute(interaction, client) {
    const key = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    
    await interaction.reply({ content: `🔐 Generated key: \`${key}\`` });
  }
};