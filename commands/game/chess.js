/**
 * Chess vs Bot Command
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('chess')
    .setDescription('Play Chess against the bot')
    .addStringOption(option => option.setName('difficulty').setDescription('Bot difficulty').addChoices(
      { name: 'Easy', value: 'easy' },
      { name: 'Medium', value: 'medium' },
      { name: 'Hard', value: 'hard' },
      { name: 'Expert', value: 'expert' }
    ).setRequired(false)),
  
  async execute(interaction, client) {
    const difficulty = interaction.options.getString('difficulty') || 'medium';
    
    const embed = new EmbedBuilder()
      .setTitle('♚ Chess vs Bot')
      .setDescription(`Difficulty: **${difficulty}**\n\nYou play as White. Click a piece then a square to move.`)
      .setColor(0x000000)
      .setFooter({ text: 'Click piece then destination' });
    
    await interaction.reply({ embeds: [embed] });
  }
};