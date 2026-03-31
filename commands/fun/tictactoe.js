const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

const words = [
  'javascript', 'discord', 'programming', 'gaming', 'music', 'art', 'science',
  'math', 'history', 'nature', 'technology', 'internet', 'computer', 'games',
  'anime', 'manga', 'movie', 'series', 'book', 'food', 'travel', 'photo',
  'design', 'video', 'stream', '直播', 'twitch', 'youtube', 'robot', 'ai'
];

let games = new Map();

module.exports = {
  data: new SlashCommandBuilder()
    .setName('tictactoe')
    .setDescription('Play tic tac toe with someone')
    .addUserOption(option =>
      option.setName('opponent')
        .setDescription('User to play against')
        .setRequired(true)),
  async execute(interaction) {
    const opponent = interaction.options.getUser('opponent');
    const player = interaction.user;

    if (opponent.bot) {
      return interaction.reply({ content: '❌ You can\'t play against a bot!', ephemeral: true });
    }

    if (opponent.id === player.id) {
      return interaction.reply({ content: '❌ You can\'t play against yourself!', ephemeral: true });
    }

    const board = Array(9).fill('⬜');
    const gameId = `${player.id}-${opponent.id}`;
    games.set(gameId, { board, player: player.id, opponent: opponent.id, turn: player.id });

    const row1 = new ActionRowBuilder()
      .addComponent(new ButtonBuilder().setCustomId('ttt-0').setEmoji('⬜').setStyle(ButtonStyle.Secondary))
      .addComponent(new ButtonBuilder().setCustomId('ttt-1').setEmoji('⬜').setStyle(ButtonStyle.Secondary))
      .addComponent(new ButtonBuilder().setCustomId('ttt-2').setEmoji('⬜').setStyle(ButtonStyle.Secondary));
    const row2 = new ActionRowBuilder()
      .addComponent(new ButtonBuilder().setCustomId('ttt-3').setEmoji('⬜').setStyle(ButtonStyle.Secondary))
      .addComponent(new ButtonBuilder().setCustomId('ttt-4').setEmoji('⬜').setStyle(ButtonStyle.Secondary))
      .addComponent(new ButtonBuilder().setCustomId('ttt-5').setEmoji('⬜').setStyle(ButtonStyle.Secondary));
    const row3 = new ActionRowBuilder()
      .addComponent(new ButtonBuilder().setCustomId('ttt-6').setEmoji('⬜').setStyle(ButtonStyle.Secondary))
      .addComponent(new ButtonBuilder().setCustomId('ttt-7').setEmoji('⬜').setStyle(ButtonStyle.Secondary))
      .addComponent(new ButtonBuilder().setCustomId('ttt-8').setEmoji('⬜').setStyle(ButtonStyle.Secondary));

    const embed = {
      title: '⭕❌ Tic Tac Toe',
      description: `<@${player.id}> vs <@${opponent.id}>\n\n<@${player.id}>'s turn!`,
      color: 0x5865F2,
      fields: [
        { name: 'How to play', value: 'Click buttons to place your mark!', inline: false },
      ],
    };

    await interaction.reply({ embeds: [embed], components: [row1, row2, row3] });
  },
};