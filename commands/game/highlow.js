const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

// High Low game
module.exports = {
  data: new SlashCommandBuilder()
    .setName('highlow')
    .setDescription('Play High Low card game'),
  async execute(interaction, client) {
    const deck = createDeck();
    shuffle(deck);
    
    const playerCard = deck.pop();
    const botCard = deck.pop();
    
    const playerValue = getCardValue(playerCard);
    const botValue = getCardValue(botCard);
    
    const result = playerValue > botValue ? 'You WIN! 🎉' : 
                  playerValue < botValue ? 'You LOSE 😢' : 
                  'TIE! 🤝';
    
    const embed = new EmbedBuilder()
      .setTitle('🎴 High Low')
      .setColor(playerValue > botValue ? 0x00ff00 : playerValue < botValue ? 0xff0000 : 0xffff00)
      .addFields(
        { name: 'Your Card', value: `${playerCard}`, inline: true },
        { name: 'Bot Card', value: `${botCard}`, inline: true },
        { name: 'Result', value: result }
      );
    
    await interaction.reply({ embeds: [embed] });
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

function getCardValue(card) {
  const rank = card.slice(0, -1);
  const values = { '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10, 'J': 11, 'Q': 12, 'K': 13, 'A': 14 };
  return values[rank] || 0;
}