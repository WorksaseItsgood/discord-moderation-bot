/**
 * Clyde Command - Make Clyde say something
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('clyde')
    .setDescription('Make Clyde say something')
    .addStringOption(option => option.setName('message').setDescription('Message').setRequired(true)),
  
  async execute(interaction, client) {
    const message = interaction.options.getString('message');
    
    const embed = new EmbedBuilder()
      .setTitle('🤖 Clyde')
      .setDescription(message)
      .setColor(0x5865f2);
    
    await interaction.reply({ embeds: [embed] });
  }
};