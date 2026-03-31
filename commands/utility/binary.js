/**
 * Binary Command - Convert text to binary
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

function textToBinary(text) {
  return text.split('').map(char => {
    return char.charCodeAt(0).toString(2).padStart(8, '0');
  }).join(' ');
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('binary')
    .setDescription('Convert text to binary')
    .addStringOption(option =>
      option.setName('text')
        .setDescription('Text to convert')
        .setRequired(true)
    ),
  
  async execute(interaction, client) {
    const text = interaction.options.getString('text');
    const binary = textToBinary(text);
    
    // Split if too long
    if (binary.length > 1900) {
      await interaction.reply({ content: `Binary (truncated):\n\`\`\`\n${binary.substring(0, 1900)}...\`\`\``, ephemeral: true });
    } else {
      const embed = new EmbedBuilder()
        .setTitle('💻 Text to Binary')
        .setDescription(`\`\`\`\n${binary}\n\`\`\``)
        .setColor(0x00ff00);
      
      await interaction.reply({ embeds: [embed] });
    }
  }
};