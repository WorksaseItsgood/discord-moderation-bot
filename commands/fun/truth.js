/**
 * Truth Command
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('truth')
    .setDescription('Get a truth question'),
  
  async execute(interaction, client) {
    const truths = [
      'What is your biggest fear?',
      'What is your biggest regret?',
      'Who is your secret crush?',
      'What is your worst habit?',
      'Have you ever lied to your best friend?',
      'What is the most embarrassing thing you\'ve done?',
      'What is your guilty pleasure?'
    ];
    
    const truth = truths[Math.floor(Math.random() * truths.length)];
    
    await interaction.reply({ content: `🎯 **Truth:** ${truth}` });
  }
};