const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

const wordList = [
  'apple', 'banana', 'cherry', 'dragon', 'elephant', 'falcon', 'guitar', 'hamburger',
  'island', 'jungle', 'kangaroo', 'lemon', 'mango', 'narwhal', 'orange', 'panda',
  'quartz', 'rainbow', 'sunflower', 'tiger', 'umbrella', 'volcano', 'whale', 'xylophone',
  'yacht', 'zebra', 'bridge', 'castle', 'dolphin', 'eagle', 'firework', 'glacier',
  'harbor', 'igloo', 'jellyfish', 'koala', 'lighthouse', 'moonlight', 'notebook',
  'ocean', 'penguin', 'quicksand', 'rainforest', 'snowstorm', 'tornado', 'waterfall'
];

let activeGames = new Map();

function getWordDisplay(word, guessed) {
  return word.split('').map(l => guessed.has(l) ? l : '_').join(' ');
}

function getHangmanFrame(strikes) {
  const frames = [
    '```
  +---+\n  |   |\n      |\n      |\n      |\n      |\n=========```',
    '```
  +---+\n  |   |\n  O   |\n      |\n      |\n      |\n=========```',
    '```
  +---+\n  |   |\n  O   |\n  |   |\n      |\n      |\n=========```',
    '```
  +---+\n  |   |\n  O   |\n /|   |\n      |\n      |\n=========```',
    '```
  +---+\n  |   |\n  O   |\n /|\\  |\n      |\n      |\n=========```',
    '```
  +---+\n  |   |\n  O   |\n /|\\  |\n /    |\n      |\n=========```',
    '```
  +---+\n  |   |\n  O   |\n /|\\  |\n / \\  |\n      |\n=========```'
  ];
  return frames[strikes] || frames[6];
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('hangman')
    .setDescription('Play hangman'),
  async execute(interaction) {
    const word = wordList[Math.floor(Math.random() * wordList.length)];
    const gameId = interaction.user.id;
    activeGames.set(gameId, { word, guessed: new Set(), strikes: 0 });

    const embed = {
      title: '🎭 Hangman',
      description: getHangmanFrame(0) + '\n\n**Word:** ' + getWordDisplay(word, new Set()) + '\n\nGuess a letter!',
      color: 0x5865F2,
    };

    await interaction.reply({ embeds: [embed] });
  },
};