/**
 * Insult Command
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('insult')
    .setDescription('Insult a user')
    .addUserOption(option => option.setName('user').setDescription('User to insult').setRequired(false)),
  
  async execute(interaction, client) {
    const user = interaction.options.getUser('user');
    const insults = [
      'You\'re not the sharpest tool in the shed.',
      'You have the charisma of a damp rag.',
      'Your code is spaghetti.',
      'Your music taste is questionable.'
    ];
    
    const insult = insults[Math.floor(Math.random() * insults.length)];
    
    await interaction.reply({ content: `💢 ${user ? user.username + ': ' + insult : insult}` });
  }
};