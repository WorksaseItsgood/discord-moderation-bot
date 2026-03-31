/**
 * Calculator Command - Calculate expressions
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('calc')
    .setDescription('Calculate an expression')
    .addStringOption(option =>
      option.setName('expression')
        .setDescription('Expression to calculate (e.g., 2+2*3)')
        .setRequired(true)
    ),
  
  async execute(interaction, client) {
    const expr = interaction.options.getString('expression');
    
    // Simple calculator (limited - supports basic operations)
    try {
      // Sanitize input - only allow safe characters
      const sanitized = expr.replace(/[^0-9+\-*/().\s]/g, '');
      
      // Use Function constructor for basic math (safer than eval)
      const result = new Function('return ' + sanitized)();
      
      const embed = new EmbedBuilder()
        .setTitle('🧮 Calculator')
        .addFields(
          { name: 'Expression', value: expr },
          { name: 'Result', value: result.toString() }
        )
        .setColor(0x00ff00);
      
      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      await interaction.reply({ content: 'Invalid expression!', ephemeral: true });
    }
  }
};