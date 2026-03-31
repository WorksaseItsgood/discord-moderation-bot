/**
 * Dare Command
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('dare')
    .setDescription('Get a dare challenge'),
  
  async execute(interaction, client) {
    const dares = [
      'Do 10 pushups!',
      'Sing a song of your choice!',
      'Let someone style your hair!',
      'Do a funny dance for 30 seconds!',
      'Let the group send a message to someone!',
      'Do your best impression of another member!',
      'Keep a straight face for 1 minute!'
    ];
    
    const dare = dares[Math.floor(Math.random() * dares.length)];
    
    await interaction.reply({ content: `🎯 **Dare:** ${dare}` });
  }
};