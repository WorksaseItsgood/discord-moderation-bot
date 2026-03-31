/**
 * Play Sound Command
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('playsound')
    .setDescription('Play a sound')
    .addStringOption(option => option.setName('sound').setDescription('Sound name').setRequired(true)),
  
  async execute(interaction, client) {
    const sound = interaction.options.getString('sound');
    
    await interaction.reply({ content: `🎵 Playing: ${sound}` });
  }
};