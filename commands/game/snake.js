/**
 * Snake Game Command
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('snake')
    .setDescription('Play a game of Snake')
    .addStringOption(option => option.setName('difficulty').setDescription('Difficulty level').addChoices(
      { name: 'Easy', value: 'easy' },
      { name: 'Medium', value: 'medium' },
      { name: 'Hard', value: 'hard' }
    ).setRequired(false)),
  
  async execute(interaction, client) {
    const difficulty = interaction.options.getString('difficulty') || 'medium';
    const speeds = { easy: 150, medium: 100, hard: 70 };
    const speed = speeds[difficulty];
    
    const embed = new EmbedBuilder()
      .setTitle('🐍 Snake Game')
      .setDescription(`Difficulty: **${difficulty}**\n\nUse the buttons to control the snake!\n\n🎮 Click Start to begin playing.`)
      .setColor(0x00ff00)
      .setFooter({ text: 'Use buttons to play' });
    
    await interaction.reply({ embeds: [embed] });
  }
};