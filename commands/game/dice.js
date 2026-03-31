/**
 * Dice Roll Command
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('dice')
    .setDescription('Roll dice')
    .addIntegerOption(option => option.setName('sides').setDescription('Number of sides').setMinValue(2).setMaxValue(100).setRequired(false)),
  
  async execute(interaction, client) {
    const sides = interaction.options.getInteger('sides') || 6;
    const roll = Math.floor(Math.random() * sides) + 1;
    
    const embed = new EmbedBuilder()
      .setTitle('🎲 Dice Roll')
      .setDescription(`You rolled a **${roll}** on a ${sides}-sided die!`)
      .setColor(0x00ff00);
    
    await interaction.reply({ embeds: [embed] });
  }
};