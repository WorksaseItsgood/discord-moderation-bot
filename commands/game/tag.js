/**
 * Tag Game Command
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('tag')
    .setDescription('Play Tag with other server members'),
  
  async execute(interaction, client) {
    const embed = new EmbedBuilder()
      .setTitle('🏷️ Tag Game')
      .setDescription('A game of Tag! Someone is "it" and must tag others.\n\nTag a user to make them "it"!')
      .setColor(0xff0000)
      .setFooter({ text: 'Use /tag @user to tag someone' });
    
    await interaction.reply({ embeds: [embed] });
  }
};