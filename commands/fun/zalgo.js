/**
 * Zalgo Command - Corrupt text with Zalgo characters
 */

const { SlashCommandBuilder } = require('discord.js');

// Zalgo combining characters
const zalgoChars = [
  '\u0300', '\u0301', '\u0302', '\u0303', '\u0304', '\u0305', '\u0306', '\u0307', '\u0308',
  '\u0309', '\u030A', '\u030B', '\u030C', '\u030D', '\u030E', '\u030F', '\u0310', '\u0311',
  '\u0312', '\u0313', '\u0314', '\u0315', '\u0316', '\u0317', '\u0318', '\u0319', '\u031A',
  '\u031B', '\u031C', '\u031D', '\u031E', '\u031F', '\u0320', '\u0321', '\u0322', '\u0323',
  '\u0324', '\u0325', '\u0326', '\u0327', '\u0328', '\u0329', '\u032A', '\u032B', '\u032C',
  '\u032D', '\u032E', '\u032F', '\u0330', '\u0331', '\u0332', '\u0333', '\u0334', '\u0335',
  '\u0336', '\u0337', '\u0338', '\u0339', '\u033A', '\u033B', '\u033C', '\u033D', '\u033E',
  '\u033F', '\u0340', '\u0341', '\u0342', '\u0343', '\u0344', '\u0345', '\u0346', '\u0347',
  '\u0348', '\u0349', '\u034A', '\u034B', '\u034C', '\u034D', '\u034E', '\u034F', '\u0350'
];

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function zalgo(text, intensity = 5) {
  let result = '';
  for (const char of text) {
    result += char;
    const numChars = randomInt(0, intensity);
    for (let i = 0; i < numChars; i++) {
      result += zalgoChars[randomInt(0, zalgoChars.length - 1)];
    }
  }
  return result;
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('zalgo')
    .setDescription('Corrupt text with zalgo')
    .addStringOption(option =>
      option.setName('text')
        .setDescription('Text to corrupt')
        .setRequired(true)
    )
    .addIntegerOption(option =>
      option.setName('intensity')
        .setDescription('Intensity level (1-10)')
        .setRequired(false)
    ),
  
  async execute(interaction, client) {
    const text = interaction.options.getString('text');
    const intensity = Math.min(10, Math.max(1, interaction.options.getInteger('intensity') || 5));
    const corrupted = zalgo(text, intensity);
    
    await interaction.reply(corrupted.substring(0, 2000));
  }
};