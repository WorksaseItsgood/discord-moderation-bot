/**
 * 2048 Game Command
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('2048')
    .setDescription('Play the 2048 puzzle game'),
  
  async execute(interaction, client) {
    const embed = new EmbedBuilder()
      .setTitle('🔢 2048 Game')
      .setDescription('Merge numbers to reach 2048!\n\nUse the reaction buttons to move tiles.\n\n🎮 Click the buttons to play!')
      .setColor(0xffaa00)
      .setFooter({ text: 'Use reactions to play' });
    
    await interaction.reply({ embeds: [embed] });
  }
};