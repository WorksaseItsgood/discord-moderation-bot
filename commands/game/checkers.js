/**
 * Checkers Game Command
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('checkers')
    .setDescription('Play Checkers against the bot')
    .addUserOption(option => option.setName('opponent').setDescription('Play against a user').setRequired(false)),
  
  async execute(interaction, client) {
    const opponent = interaction.options.getUser('opponent');
    
    const embed = new EmbedBuilder()
      .setTitle('♟️ Checkers')
      .setDescription(opponent ? `Play against: ${opponent.username}` : 'Playing against the bot!\n\nClick to move your piece.')
      .setColor(0x000000)
      .setFooter({ text: 'Click a piece then a square to move' });
    
    await interaction.reply({ embeds: [embed] });
  }
};