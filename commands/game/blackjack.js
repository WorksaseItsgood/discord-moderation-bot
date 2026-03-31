const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

// Blackjack game
module.exports = {
  data: new SlashCommandBuilder()
    .setName('blackjack')
    .setDescription('Play Blackjack')
    .addIntegerOption(option =>
      option.setName('bet')
        .setDescription('Bet amount')
        .setMinValue(1)
        .setRequired(false)),
  async execute(interaction, client) {
    const bet = interaction.options.getInteger('bet') || 100;
    
    // Get user economy data
    const userId = interaction.user.id;
    if (!client.economy) client.economy = new Map();
    const userBal = client.economy.get(userId) || { 
      wallet: 1000, 
      bank: 0, 
      lastDaily: 0, 
      lastWeekly: 0,
      lastWork: 0,
      streak: 0,
      wins: 0,
      losses: 0
    };
    
    if (userBal.wallet < bet) {
      return interaction.reply({ content: `❌ You don't have enough money! Wallet: ${userBal.wallet}`, ephemeral: true });
    }
    
    // Create deck
    const deck = createDeck();
    shuffle(deck);
    
    // Deal cards
    const playerHand = [deck.pop(), deck.pop()];
    const dealerHand = [deck.pop(), deck.pop()];
    
    let playerScore = calculateScore(playerHand);
    let dealerScore = calculateScore(dealerHand);
    
    // Check for blackjack
    let gameOver = false;
    let result = '';
    let winMultiplier = 1;
    
    // Player has blackjack
    if (playerScore === 21 && playerHand.length === 2) {
      if (dealerScore !== 21) {
        result = 'BLACKJACK! 🎉 You win!';
        winMultiplier = 2.5;
        userBal.wallet += Math.floor(bet * 1.5);
      } else {
        result = 'PUSH - Both have Blackjack!';
        userBal.wallet += bet;
        winMultiplier = 0;
      }
      gameOver = true;
    }
    
    // Dealer has blackjack
    if (!gameOver && dealerScore === 21 && dealerHand.length === 2) {
      result = 'Dealer Blackjack! You lose!';
      winMultiplier = 0;
      gameOver = true;
    }
    
    // Build embed
    if (!gameOver) {
      const embed = new EmbedBuilder()
        .setTitle('🎴 Blackjack')
        .setColor(0x0099ff)
        .addFields(
          { name: 'Your Hand', value: playerHand.join(' ') },
          { name: 'Your Score', value: String(playerScore), inline: true },
          { name: 'Bet', value: String(bet), inline: true }
        )
        .setDescription('Do you want to **hit** or **stand**? (This is a basic version, you automatically win if your score is higher!)');
      
      // For simple version, determine winner immediately
      if (playerScore > 21) {
        result = 'BUST! You lose!';
        winMultiplier = 0;
      } else if (dealerScore > 21) {
        result = 'Dealer busts! You win! 🎉';
        winMultiplier = 2;
      } else if (playerScore > dealerScore) {
        result = `You win! (${playerScore} vs ${dealerScore}) 🎉`;
        winMultiplier = 2;
      } else if (playerScore < dealerScore) {
        result = `You lose! (${playerScore} vs ${dealerScore})`;
        winMultiplier = 0;
      } else {
        result = `PUSH - Tie! (${playerScore} vs ${dealerScore})`;
        winMultiplier = 1;
      }
    }
    
    // Update economy
    if (winMultiplier > 0) {
      userBal.wallet += bet * (winMultiplier - 1);
    }
    userBal.wallet -= bet;
    
    if (winMultiplier > 1) {
      userBal.wins++;
    } else if (winMultiplier === 0) {
      userBal.losses++;
    }
    
    client.economy.set(userId, userBal);
    
    const finalEmbed = new EmbedBuilder()
      .setTitle('🎴 Blackjack - Game Over')
      .setColor(winMultiplier > 1 ? 0x00ff00 : winMultiplier === 0 ? 0xff0000 : 0xffff00)
      .addFields(
        { name: 'Your Hand', value: playerHand.join(' '), inline: true },
        { name: 'Your Score', value: String(playerScore), inline: true },
        { name: 'Dealer Hand', value: dealerHand.join(' '), inline: true },
        { name: 'Dealer Score', value: String(dealerScore), inline: true },
        { name: 'Result', value: result },
        { name: 'New Balance', value: String(userBal.wallet), inline: true }
      );
    
    await interaction.reply({ embeds: [finalEmbed] });
  }
};

function createDeck() {
  const suits = ['♠️', '♥️', '♦️', '♣️'];
  const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
  const deck = [];
  
  for (const suit of suits) {
    for (const rank of ranks) {
      deck.push(`${rank}${suit}`);
    }
  }
  
  return deck;
}

function shuffle(deck) {
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
}

function calculateScore(hand) {
  let score = 0;
  let aces = 0;
  
  for (const card of hand) {
    const rank = card.slice(0, -1);
    if (rank === 'A') {
      aces++;
      score += 11;
    } else if (['J', 'Q', 'K'].includes(rank)) {
      score += 10;
    } else {
      score += parseInt(rank);
    }
  }
  
  // Adjust for aces
  while (score > 21 && aces > 0) {
    score -= 10;
    aces--;
  }
  
  return score;
}