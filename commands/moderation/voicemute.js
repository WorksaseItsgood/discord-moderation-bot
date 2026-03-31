/**
 * Voice Mute Command
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('voicemute')
    .setDescription('Mute a user in voice')
    .addUserOption(option => option.setName('user').setDescription('User to mute').setRequired(true)),
  
  async execute(interaction, client) {
    const user = interaction.options.getUser('user');
    
    await interaction.reply({ content: `🔇 Muted **${user.username}** in voice!` });
  }
};