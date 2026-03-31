const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder } = require('discord.js');

// Tic Tac Toe game
const activeGames = new Map();

module.exports = {
  data: new SlashCommandBuilder()
    .setName('tictactoe')
    .setDescription('Play Tic Tac Toe against the bot or another user')
    .addUserOption(option =>
      option.setName('opponent')
        .setDescription('User to play against (leave empty to play vs bot)')
        .setRequired(false)),
  async execute(interaction, client) {
    const opponent = interaction.options.getUser('opponent');
    const player1 = interaction.user;
    const player2 = opponent || client.user;
    
    // Create game board
    const game = {
      board: Array(9).fill(' '),
      players: [player1.id, player2.id],
      currentPlayer: 0, // 0 = player1, 1 = player2
      symbols: ['❌', '⭕'],
      message: null,
      won: false
    };
    
    const embed = createGameEmbed(game, player1, player2);
    const components = createGameButtons(game);
    
    const reply = await interaction.reply({ 
      embeds: [embed], 
      components: [components],
      fetchReply: true 
    });
    
    game.message = reply;
    activeGames.set(reply.id, game);
    
    // Wait for moves (handled by button interactions)
    setTimeout(() => {
      if (activeGames.has(reply.id)) {
        activeGames.delete(reply.id);
      }
    }, 300000); // 5 min timeout
  }
};

function createGameEmbed(game, player1, player2) {
  const board = game.board.map((cell, i) => cell === ' ' ? String(i + 1) : cell).reduce((rows, cell, i) => {
    if (i % 3 === 0) rows.push([]);
    rows[rows.length - 1].push(cell);
    return rows;
  }, []).map(row => row.join(' │ ')).join('\n');
  
  const currentPlayer = game.currentPlayer === 0 ? player1 : player2;
  const symbol = game.symbols[game.currentPlayer];
  
  return new EmbedBuilder()
    .setTitle('🎮 Tic Tac Toe')
    .setColor(0x0099ff)
    .setDescription(`**Board:**\n\`\`\`${board}\`\`\n\n**Turn:** ${currentPlayer} (${symbol})`)
    .setFooter({ text: game.won ? 'Game Over!' : 'Click a button to play' });
}

function createGameButtons(game) {
  const buttons = [];
  
  for (let i = 0; i < 9; i++) {
    const label = game.board[i] === ' ' ? String(i + 1) : game.board[i];
    buttons.push(
      new ButtonBuilder()
        .setCustomId(`ttt_${i}`)
        .setLabel(label)
        .setStyle(game.board[i] === ' ' ? 1 : 2)
    );
  }
  
  // Create rows of 3 buttons
  const rows = [
    new ActionRowBuilder({ components: buttons.slice(0, 3) }),
    new ActionRowBuilder({ components: buttons.slice(3, 6) }),
    new ActionRowBuilder({ components: buttons.slice(6, 9) })
  ];
  
  return rows;
}

// Export for interaction handler
module.exports.handleButton = async function(interaction, client) {
  const customId = interaction.customId;
  
  if (!customId.startsWith('ttt_')) return false;
  
  const index = parseInt(customId.replace('ttt_', ''));
  const messageId = interaction.message.id;
  const game = activeGames.get(messageId);
  
  if (!game) {
    await interaction.reply({ content: 'Game not found or expired!', ephemeral: true });
    return true;
  }
  
  // Check if correct player
  const currentPlayerId = game.players[game.currentPlayer];
  if (interaction.user.id !== currentPlayerId) {
    await interaction.reply({ content: "It's not your turn!", ephemeral: true });
    return true;
  }
  
  // Make move
  if (game.board[index] !== ' ') {
    await interaction.reply({ content: 'That space is taken!', ephemeral: true });
    return true;
  }
  
  game.board[index] = game.symbols[game.currentPlayer];
  
  // Check for win
  const winPatterns = [
    [0,1,2], [3,4,5], [6,7,8], // rows
    [0,3,6], [1,4,7], [2,5,8], // cols
    [0,4,8], [2,4,6] // diagonals
  ];
  
  for (const [a, b, c] of winPatterns) {
    if (game.board[a] !== ' ' && game.board[a] === game.board[b] && game.board[a] === game.board[c]) {
      game.won = true;
      break;
    }
  }
  
  // Check for tie
  if (!game.won && !game.board.includes(' ')) {
    game.won = true; //tie
  }
  
  // Switch player
  if (!game.won) {
    game.currentPlayer = 1 - game.currentPlayer;
  }
  
  // Update message
  const player1 = await client.users.fetch(game.players[0]);
  const player2 = await client.users.fetch(game.players[1]);
  
  const embed = createGameEmbed(game, player1, player2);
  const components = createGameButtons(game);
  
  await interaction.update({ embeds: [embed], components });
  
  return true;
};