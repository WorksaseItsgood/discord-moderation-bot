const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

const LOW = 1;
const HIGH = 100;
let currentNumber = Math.floor(Math.random() * (HIGH - LOW + 1)) + LOW;
let attempts = 0;
let players = new Map();

module.exports = {
  data: new SlashCommandBuilder()
    .setName('highlow')
    .setDescription('Guess if the next number is higher or lower')
    .addStringOption(option =>
      option.setName('guess')
        .setDescription('Your guess')
        .addStringChoice('higher', 'higher')
        .addStringChoice('lower', 'lower')
        .setRequired(true)),
  async execute(interaction) {
    const guess = interaction.options.getString('guess');
    const userId = interaction.user.id;

    if (!players.has(userId)) {
      players.set(userId, { number: Math.floor(Math.random() * 100) + 1, attempts: 0 });
    }

    const player = players.get(userId);
    const oldNumber = player.number;
    const newNumber = Math.floor(Math.random() * 100) + 1;
    player.number = newNumber;
    player.attempts++;
    players.set(userId, player);

    let correct = false;
    if (guess === 'higher' && newNumber > oldNumber) correct = true;
    if (guess === 'lower' && newNumber < oldNumber) correct = true;
    if (newNumber === oldNumber) correct = true;

    const embed = {
      title: '🎯 High Low Game',
      description: `**Old number:** ${oldNumber}\n**New number:** ${newNumber}\n\n**Your guess:** ${guess === 'higher' ? '⬆️ Higher' : '⬇️ Lower'}`,
      fields: [
        { name: correct ? '✅ Correct!' : '❌ Wrong!', value: `Score: ${player.attempts}`, inline: true },
      ],
      color: correct ? 0x00FF00 : 0xFF0000,
      timestamp: new Date().toISOString(),
    };

    await interaction.reply({ embeds: [embed] });
  },
};