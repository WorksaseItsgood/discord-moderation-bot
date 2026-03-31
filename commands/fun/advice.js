/**
 * Advice Command
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('advice')
    .setDescription('Get some random advice'),
  
  async execute(interaction, client) {
    const advices = [
      'Take breaks regularly to stay fresh.',
      'Always think before you speak.',
      'Don\'t be afraid to ask for help.',
      'Practice makes perfect.',
      'Stay positive and good things will happen.',
      'Learn from your mistakes.',
      'Treat others how you want to be treated.'
    ];
    
    const advice = advices[Math.floor(Math.random() * advices.length)];
    
    const embed = new EmbedBuilder()
      .setTitle('💡 Advice')
      .setDescription(advice)
      .setColor(0x00ff00);
    
    await interaction.reply({ embeds: [embed] });
  }
};