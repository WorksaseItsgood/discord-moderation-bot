const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder } = require('discord.js');

// Hangman game
const activeGames = new Map();
const wordList = [
  'programming', 'javascript', 'discord', 'developer', 'keyboard', 
  'computer', 'internet', 'database', 'algorithm', 'function',
  'variable', 'constant', 'browser', 'network', 'server',
  'application', 'interface', 'memory', 'processor', 'system'
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('hangman')
    .setDescription('Play Hangman'),
  async execute(interaction, client) {
    const word = wordList[Math.floor(Math.random() * wordList.length)];
    
    const game = {
      word,
      display: Array(word.length).fill('_'),
      guesses: new Set(),
      wrongGuesses: 0,
      maxWrong: 6,
      player: interaction.user.id,
      won: false,
      lost: false
    };
    
    const embed = createHangmanEmbed(game);
    const components = createKeyboard(game);
    
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

function createHangmanEmbed(game) {
  const galows = [
    '  ┌─────┐\n  │     │\n        │\n        │\n        │\n        │\n==========',
    '  ┌─────┐\n  │     │\n  O     │\n        │\n        │\n        │\n==========',
    '  ┌─────┐\n  │     │\n  O     │\n  |     │\n        │\n        │\n==========',
    '  ┌─────┐\n  │     │\n  O     │\n /|     │\n        │\n        │\n==========',
    '  ┌─────┐\n  │     │\n  O     │\n /|\\    │\n        │\n        │\n==========',
    '  ┌─────┐\n  │     │\n  O     │\n /|\\    │\n /      │\n        │\n==========',
    '  ┌─────┐\n  │     │\n  O     │\n /|\\    │\n / \\    │\n        │\n=========='
  ];
  
  const stage = Math.min(game.wrongGuesses, 6);
  const status = game.won ? '🎉 YOU WIN!' : game.lost ? '💀 GAME OVER!' : `Attempts: ${game.wrongGuesses}/${game.maxWrong}`;
  
  return new EmbedBuilder()
    .setTitle('🎮 Hangman')
    .setColor(game.won ? 0x00ff00 : game.lost ? 0xff0000 : 0x0099ff)
    .setDescription(`\`\`\`${galows[stage]}\`\`\`\n\n**Word:** ${game.display.join(' ')}\n\n**Guessed:** ${[...game.guesses].join(', ') || 'None'}\n\n**Status:** ${status}`);
}

function createKeyboard(game) {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  const buttons = letters.map(letter => 
    new ButtonBuilder()
      .setCustomId(`hangman_${letter}`)
      .setLabel(letter)
      .setStyle(game.guesses.has(letter) ? 4 : 1)
      .setDisabled(game.won || game.lost || game.guesses.has(letter))
  );
  
  const rows = [];
  for (let i = 0; i < letters.length; i += 7) {
    rows.push(new ActionRowBuilder({ components: buttons.slice(i, i + 7) }));
  }
  
  return rows;
}

module.exports.handleButton = async function(interaction, client) {
  const customId = interaction.customId;
  
  if (!customId.startsWith('hangman_')) return false;
  
  const letter = customId.replace('hangman_', '');
  const messageId = interaction.message.id;
  const game = activeGames.get(messageId);
  
  if (!game) {
    await interaction.reply({ content: 'Game not found or expired!', ephemeral: true });
    return true;
  }
  
  if (interaction.user.id !== game.player) {
    await interaction.reply({ content: "You're not in this game!", ephemeral: true });
    return true;
  }
  
  if (game.won || game.lost) {
    await interaction.reply({ content: 'Game is already over!', ephemeral: true });
    return true;
  }
  
  game.guesses.add(letter);
  
  if (game.word.toUpperCase().includes(letter)) {
    // Correct guess - reveal letters
    for (let i = 0; i < game.word.length; i++) {
      if (game.word[i].toUpperCase() === letter) {
        game.display[i] = letter;
      }
    }
    
    // Check win
    if (!game.display.includes('_')) {
      game.won = true;
    }
  } else {
    // Wrong guess
    game.wrongGuesses++;
    
    if (game.wrongGuesses >= game.maxWrong) {
      game.lost = true;
    }
  }
  
  const embed = createHangmanEmbed(game);
  const components = createKeyboard(game);
  
  await interaction.update({ embeds: [embed], components });
  
  return true;
};