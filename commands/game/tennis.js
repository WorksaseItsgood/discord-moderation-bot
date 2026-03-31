/**
 * Tennis Game Command
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('tennis')
    .setDescription('Play tennis against the bot'),
  
  async execute(interaction, client) {
    const embed = new EmbedBuilder()
      .setTitle('🎾 Tennis')
      .setDescription('Hit the ball back over the net!\n\nUse buttons to aim your shots.')
      .setColor(0xffff00)
      .setFooter({ text: 'Use buttons to aim' });
    
    await interaction.reply({ embeds: [embed] });
  }
};