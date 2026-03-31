const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder } = require('discord.js');

// Connect 4 game
const activeGames = new Map();

module.exports = {
  data: new SlashCommandBuilder()
    .setName('connect4')
    .setDescription('Play Connect 4 against another user')
    .addUserOption(option =>
      option.setName('opponent')
        .setDescription('User to play against (leave empty to play vs bot)')
        .setRequired(false)),
  async execute(interaction, client) {
    const opponent = interaction.options.getUser('opponent');
    const player1 = interaction.user;
    const player2 = opponent || client.user;
    
    const game = {
      board: Array(42).fill(null), // 6x7 grid
      players: [player1.id, player2.id],
      symbols: ['🔴', '🟡'],
      currentPlayer: 0,
      message: null,
      won: false
    };
    
    const embed = createConnect4Embed(game, player1, player2);
    const components = createConnect4Buttons(game);
    
    const reply = await interaction.reply({ 
      embeds: [embed], 
      components: [components],
      fetchReply: true 
    });
    
    activeGames.set(reply.id, game);
    
    setTimeout(() => {
      if (activeGames.has(reply.id)) {
        activeGames.delete(reply.id);
      }
    }, 300000);
  }
};

function createConnect4Embed(game, player1, player2) {
  let boardStr = '\n';
  for (let row = 0; row < 6; row++) {
    for (let col = 0; col < 7; col++) {
      const idx = row * 7 + col;
      const cell = game.board[idx];
      boardStr += cell || '⚪';
    }
    boardStr += '\n';
  }
  
  const currentPlayer = game.currentPlayer === 0 ? player1 : player2;
  
  return new EmbedBuilder()
    .setTitle('🔴 Connect 4')
    .setColor(0x0099ff)
    .setDescription(`**Board:**\n\`\`\`${boardStr}\`\`\`\n**Turn:** ${currentPlayer}`);
}

function createConnect4Buttons(game) {
  const buttons = [];
  
  for (let col = 0; col < 7; col++) {
    buttons.push(
      new ButtonBuilder()
        .setCustomId(`c4_${col}`)
        .setLabel(`${col + 1}`)
        .setStyle(1)
    );
  }
  
  return [new ActionRowBuilder({ components: buttons })];
}

module.exports.handleButton = async function(interaction, client) {
  const customId = interaction.customId;
  
  if (!customId.startsWith('c4_')) return false;
  
  const col = parseInt(customId.replace('c4_', ''));
  const messageId = interaction.message.id;
  const game = activeGames.get(messageId);
  
  if (!game) {
    await interaction.reply({ content: 'Game not found or expired!', ephemeral: true });
    return true;
  }
  
  const currentPlayerId = game.players[game.currentPlayer];
  if (interaction.user.id !== currentPlayerId) {
    await interaction.reply({ content: "It's not your turn!", ephemeral: true });
    return true;
  }
  
  // Find lowest empty row in column
  let row = -1;
  for (let r = 5; r >= 0; r--) {
    if (!game.board[r * 7 + col]) {
      row = r;
      break;
    }
  }
  
  if (row === -1) {
    await interaction.reply({ content: 'Column is full!', ephemeral: true });
    return true;
  }
  
  // Place piece
  game.board[row * 7 + col] = game.symbols[game.currentPlayer];
  
  // Check for win
  if (checkWin(game.board, row, col, game.symbols[game.currentPlayer])) {
    game.won = true;
  }
  
  // Check for tie
  if (!game.won && !game.board.includes(null)) {
    game.won = true; // tie
  }
  
  // Switch player
  if (!game.won) {
    game.currentPlayer = 1 - game.currentPlayer;
  }
  
  // Update message
  const player1 = await client.users.fetch(game.players[0]);
  const player2 = await client.users.fetch(game.players[1]);
  
  const embed = createConnect4Embed(game, player1, player2);
  const components = createConnect4Buttons(game);
  
  await interaction.update({ embeds: [embed], components });
  
  return true;
};

function checkWin(board, row, col, symbol) {
  // Check all directions
  return checkDirection(board, row, col, 0, 1, symbol) || // horizontal
         checkDirection(board, row, col, 1, 0, symbol) ||   // vertical
         checkDirection(board, row, col, 1, 1, symbol) ||  // diagonal /
         checkDirection(board, row, col, 1, -1, symbol); // diagonal \
}

function checkDirection(board, row, col, dRow, dCol, symbol) {
  let count = 1;
  
  // Check positive direction
  for (let i = 1; i < 4; i++) {
    const r = row + i * dRow;
    const c = col + i * dCol;
    if (r < 0 || r >= 6 || c < 0 || c >= 7) break;
    if (board[r * 7 + c] === symbol) count++;
    else break;
  }
  
  // Check negative direction
  for (let i = 1; i < 4; i++) {
    const r = row - i * dRow;
    const c = col - i * dCol;
    if (r < 0 || r >= 6 || c < 0 || c >= 7) break;
    if (board[r * 7 + c] === symbol) count++;
    else break;
  }
  
  return count >= 4;
}