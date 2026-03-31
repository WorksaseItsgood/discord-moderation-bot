/**
 * Voice Deafen Command
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('voicedeafen')
    .setDescription('Deafen a user in voice')
    .addUserOption(option => option.setName('user').setDescription('User to deafen').setRequired(true)),
  
  async execute(interaction, client) {
    const user = interaction.options.getUser('user');
    
    await interaction.reply({ content: `🔊 Deafened **${user.username}** in voice!` });
  }
};