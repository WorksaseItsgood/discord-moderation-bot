const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

const choices = ['rock', 'paper', 'scissors'];
const emojis = { rock: '🪨', paper: '📄', scissors: '✂️' };
const beats = { rock: 'scissors', paper: 'rock', scissors: 'paper' };

module.exports = {
  data: new SlashCommandBuilder()
    .setName('rps')
    .setDescription('Rock Paper Scissors')
    .addStringOption(option =>
      option.setName('choice')
        .setDescription('Your choice')
        .addStringChoice('rock', 'rock')
        .addStringChoice('paper', 'paper')
        .addStringChoice('scissors', 'scissors')
        .setRequired(true)),
  async execute(interaction) {
    const playerChoice = interaction.options.getString('choice');
    const botChoice = choices[Math.floor(Math.random() * choices.length)];

    let result = 'draw';
    if (beats[playerChoice] === botChoice) result = 'win';
    if (beats[botChoice] === playerChoice) result = 'lose';

    const messages = {
      win: '🎉 You win!',
      lose: '😢 You lose!',
      draw: '🤝 It\'s a draw!',
    };

    const embed = {
      title: '✊✋✌️ Rock Paper Scissors',
      description: `**You:** ${emojis[playerChoice]} ${playerChoice}\n**Bot:** ${emojis[botChoice]} ${botChoice}\n\n**${messages[result]}**`,
      color: result === 'win' ? 0x00FF00 : result === 'lose' ? 0xFF0000 : 0xFFFF00,
      timestamp: new Date().toISOString(),
    };

    await interaction.reply({ embeds: [embed] });
  },
};