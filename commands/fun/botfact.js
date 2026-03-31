/**
 * Bot Fact Command
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('botfact')
    .setDescription('Get a fact about the bot'),
  
  async execute(interaction, client) {
    const facts = [
      'I was made with discord.js!',
      'I can do over 500 commands!',
      'I love helping moderators keep servers safe!',
      'I never sleep, 24/7 online!',
      'I can play music in voice channels!'
    ];
    
    const fact = facts[Math.floor(Math.random() * facts.length)];
    
    await interaction.reply({ content: `🤖 Bot Fact: ${fact}` });
  }
};