/**
 * Ball Game Command
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ball')
    .setDescription('Play catch with the bot'),
  
  async execute(interaction, client) {
    const embed = new EmbedBuilder()
      .setTitle('🎱 Ball Game')
      .setDescription('Throw and catch the ball!\n\nThe ball will come back - catch it!')
      .setColor(0xffaa00)
      .setFooter({ text: 'Click to catch/throw' });
    
    await interaction.reply({ embeds: [embed] });
  }
};