/**
 * Minesweeper Game Command
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('minesweeper')
    .setDescription('Play Minesweeper')
    .addStringOption(option => option.setName('difficulty').setDescription('Difficulty').addChoices(
      { name: 'Easy (9x9, 10 mines)', value: 'easy' },
      { name: 'Medium (16x16, 40 mines)', value: 'medium' },
      { name: 'Hard (30x16, 99 mines)', value: 'hard' }
    ).setRequired(false)),
  
  async execute(interaction, client) {
    const difficulty = interaction.options.getString('difficulty') || 'easy';
    const sizes = { easy: 9, medium: 16, hard: 30 };
    const mines = { easy: 10, medium: 40, hard: 99 };
    
    const embed = new EmbedBuilder()
      .setTitle('💣 Minesweeper')
      .setDescription(`Difficulty: **${difficulty}** (${sizes[difficulty]}x${sizes[difficulty]}, ${mines[difficulty]} mines)\n\nClick cells to reveal. Use flags with right-click!`)
      .setColor(0x888888)
      .setFooter({ text: 'Click to reveal, right-click to flag' });
    
    await interaction.reply({ embeds: [embed] });
  }
};