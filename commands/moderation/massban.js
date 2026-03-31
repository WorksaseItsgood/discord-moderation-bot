/**
 * Mass Ban Command
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('massban')
    .setDescription('Ban multiple users at once')
    .addStringOption(option => option.setName('users').setDescription('User IDs (comma separated)').setRequired(true))
    .addStringOption(option => option.setName('reason').setDescription('Reason').setRequired(false)),
  
  async execute(interaction, client) {
    const users = interaction.options.getString('users');
    
    await interaction.reply({ content: `🔨 Banning users: ${users}` });
  }
};