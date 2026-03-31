/**
 * Emoji Command
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('emoji')
    .setDescription('Get a random emoji'),
  
  async execute(interaction, client) {
    const emojis = ['😀', '😂', '🤣', '😊', '😍', '🥰', '😎', '🤔', '😴', '🤯', '🥳', '😱', '🤡', '💯', '🔥', '✨', '❤️', '💀', '🎉'];
    
    await interaction.reply({ content: emojis[Math.floor(Math.random() * emojis.length)] });
  }
};