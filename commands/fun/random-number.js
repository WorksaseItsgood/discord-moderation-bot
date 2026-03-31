/**
 * Random Number Command - Generate a random number
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('random-number')
    .setDescription('Generate a random number')
    .addIntegerOption(option =>
      option.setName('min')
        .setDescription('Minimum number')
        .setRequired(false)
    )
    .addIntegerOption(option =>
      option.setName('max')
        .setDescription('Maximum number')
        .setRequired(false)
    ),
  
  async execute(interaction, client) {
    const min = interaction.options.getInteger('min') || 0;
    const max = interaction.options.getInteger('max') || 100;
    
    if (min >= max) {
      return interaction.reply({ content: 'Minimum must be less than maximum!', ephemeral: true });
    }
    
    const number = Math.floor(Math.random() * (max - min + 1)) + min;
    
    const embed = new EmbedBuilder()
      .setTitle('🎲 Random Number')
      .setDescription(`**${number}**`)
      .addFields(
        { name: 'Range', value: `${min} - ${max}` }
      )
      .setColor(0x0099ff);
    
    await interaction.reply({ embeds: [embed] });
  }
};