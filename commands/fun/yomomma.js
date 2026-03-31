/**
 * Yo Momma Command
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('yomomma')
    .setDescription('Yo momma joke'),
  
  async execute(interaction, client) {
    const jokes = [
      'Yo momma so fat, she sat on a dollar and made change.',
      'Yo momma so ugly, she looked in the mirror and the reflection fell out.',
      'Yo momma so poor, her fridge has only pictures of food.',
      'Yo momma so short, she has to look up to look down.'
    ];
    
    const joke = jokes[Math.floor(Math.random() * jokes.length)];
    
    await interaction.reply({ content: `😂 ${joke}` });
  }
};