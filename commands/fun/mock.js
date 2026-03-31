/**
 * Mock Command - MoCk TeXt
 */

const { SlashCommandBuilder } = require('discord.js');

function mockText(str) {
  let result = '';
  let upper = true;
  for (const char of str) {
    if (char.match(/[a-zA-Z]/)) {
      result += upper ? char.toUpperCase() : char.toLowerCase();
      upper = !upper;
    } else {
      result += char;
    }
  }
  return result;
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('mock')
    .setDescription('MoCk TeXt LiKe ThIs')
    .addStringOption(option =>
      option.setName('text')
        .setDescription('Text to mock')
        .setRequired(true)
    ),
  
  async execute(interaction, client) {
    const text = interaction.options.getString('text');
    const mocked = mockText(text);
    
    await interaction.reply(mocked.substring(0, 2000));
  }
};