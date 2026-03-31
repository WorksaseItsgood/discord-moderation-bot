/**
 * Would You Rather Command
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('wyr')
    .setDescription('Get a would you rather question'),
  
  async execute(interaction, client) {
    const questions = [
      'Would you rather be able to fly or be invisible?',
      'Would you rather have unlimited money or unlimited time?',
      'Would you rather live in the past or the future?',
      'Would you rather be famous or unrecognizable?',
      'Would you rather be the funniest or the smartest?',
      'Would you rather always say what you think or never speak again?'
    ];
    
    const question = questions[Math.floor(Math.random() * questions.length)];
    
    await interaction.reply({ content: `🤔 **Would you rather...** ${question}` });
  }
};