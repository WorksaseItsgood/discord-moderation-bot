/**
 * Vaporwave Command - Convert text to full-width characters
 */

const { SlashCommandBuilder } = require('discord.js');

function toFullwidth(str) {
  return str.replace(/[a-zA-Z0-9!"#$%&'()*+,\-./:;<=>?@[\]^_`{|}~]/g, (char) => {
    const code = char.charCodeAt(0);
    if (code >= 33 && code <= 126) {
      return String.fromCharCode(code + 0xFEE0);
    }
    return char;
  });
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('vaporwave')
    .setDescription('Convert text to ｖａｃａｖｅ ｓｔｙｌｅ')
    .addStringOption(option =>
      option.setName('text')
        .setDescription('Text to convert')
        .setRequired(true)
    ),
  
  async execute(interaction, client) {
    const text = interaction.options.getString('text');
    const result = toFullwidth(text);
    
    await interaction.reply(result.substring(0, 2000));
  }
};