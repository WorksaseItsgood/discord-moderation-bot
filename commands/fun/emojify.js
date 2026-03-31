const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

// Emojify command - Convert text to emoji letters
module.exports = {
  data: new SlashCommandBuilder()
    .setName('emojify')
    .setDescription('Convert text to emoji letters')
    .addStringOption(option =>
      option.setName('text')
        .setDescription('Text to emojify')
        .setRequired(true)),
  async execute(interaction, client) {
    const text = interaction.options.getString('text').toLowerCase();
    
    const emojiMap = {
      'a': '🇦', 'b': '🇧', 'c': '🇨', 'd': '🇩', 'e': '🇪', 'f': '🇫',
      'g': '🇬', 'h': '🇭', 'i': '🇮', 'j': '🇯', 'k': '🇰', 'l': '🇱',
      'm': '🇲', 'n': '🇳', 'o': '🇴', 'p': '🇵', 'q': '🇶', 'r': '🇷',
      's': '🇸', 't': '🇹', 'u': '🇺', 'v': '🇻', 'w': '🇼', 'x': '🇽',
      'y': '🇾', 'z': '🇿', '0': '0️⃣', '1': '1️⃣', '2': '2️⃣',
      '3': '3️⃣', '4': '4️⃣', '5': '5️⃣', '6': '6️⃣', '7': '7️⃣',
      '8': '8️⃣', '9': '9️⃣', ' ': '   '
    };
    
    const emojiText = text.split('').map(char => {
      if (emojiMap[char]) return emojiMap[char];
      return char;
    }).join(' ');
    
    const embed = new EmbedBuilder()
      .setTitle('✨ Emojify')
      .setColor(0x00ff00)
      .setDescription(emojiText)
      .setFooter({ text: `Original: ${text}` });
    
    await interaction.reply({ embeds: [embed] });
  }
};