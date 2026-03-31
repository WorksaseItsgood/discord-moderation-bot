/**
 * Roll Command - Roll dice
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('roll')
    .setDescription('Roll dice')
    .addIntegerOption(option =>
      option.setName('sides')
        .setDescription('Number of sides (default 6)')
        .setRequired(false)
    )
    .addIntegerOption(option =>
      option.setName('count')
        .setDescription('Number of dice (default 1)')
        .setRequired(false)
    ),
  
  async execute(interaction, client) {
    const sides = Math.max(2, Math.min(100, interaction.options.getInteger('sides') || 6));
    const count = Math.max(1, Math.min(10, interaction.options.getInteger('count') || 1));
    
    const rolls = [];
    let total = 0;
    
    for (let i = 0; i < count; i++) {
      const roll = Math.floor(Math.random() * sides) + 1;
      rolls.push(roll);
      total += roll;
    }
    
    const diceEmoji = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];
    const diceDisplay = rolls.map(r => diceEmoji[Math.min(r - 1, 5)]).join(' ');
    
    const embed = new EmbedBuilder()
      .setTitle('🎲 Dice Roll')
      .setDescription(diceDisplay)
      .addFields(
        { name: 'Rolls', value: rolls.join(', ') },
        { name: 'Total', value: total.toString() },
        { name: 'Sides', value: sides.toString() }
      )
      .setColor(0x0099ff);
    
    await interaction.reply({ embeds: [embed] });
  }
};