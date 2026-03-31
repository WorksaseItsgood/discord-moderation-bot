/**
 * Compliment Command
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('compliment')
    .setDescription('Compliment a user')
    .addUserOption(option => option.setName('user').setDescription('User to compliment').setRequired(false)),
  
  async execute(interaction, client) {
    const user = interaction.options.getUser('user') || interaction.user;
    const compliments = [
      'You\'re amazing!',
      'You\'re one of a kind!',
      'Your smile lights up the room!',
      'You\'re incredibly talented!',
      'You make the world better!',
      'You\'re absolutely wonderful!'
    ];
    
    const compliment = compliments[Math.floor(Math.random() * compliments.length)];
    
    await interaction.reply({ content: `✨ ${user.username}: ${compliment}` });
  }
};