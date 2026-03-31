/**
 * Slots Command - Slot machine game
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const symbols = ['🍒', '🍋', '🍊', '🍇', '🔔', '💎', '7️⃣'];
const weights = [35, 25, 20, 12, 5, 2, 1];

function weightedRandom() {
  const totalWeight = weights.reduce((a, b) => a + b, 0);
  let random = Math.random() * totalWeight;
  
  for (let i = 0; i < symbols.length; i++) {
    random -= weights[i];
    if (random <= 0) return symbols[i];
  }
  return symbols[symbols.length - 1];
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('slots')
    .setDescription('Play the slot machine')
    .addIntegerOption(option =>
      option.setName('bet')
        .setDescription('Amount to bet')
        .setRequired(false)
    ),
  
  async execute(interaction, client) {
    const bet = interaction.options.getInteger('bet') || 100;
    const dbManager = client.dbManager;
    
    // Get user balance
    let balance = 0;
    if (dbManager) {
      balance = dbManager.getBalance(interaction.user.id, interaction.guildId);
      if (balance < bet) {
        return interaction.reply({ content: `You don't have enough coins! Your balance: ${balance}`, ephemeral: true });
      }
      dbManager.removeBalance(interaction.user.id, interaction.guildId, bet);
    } else {
      balance = 1000;
    }
    
    const reel1 = weightedRandom();
    const reel2 = weightedRandom();
    const reel3 = weightedRandom();
    
    let winnings = 0;
    let result = '';
    
    // Check for wins
    if (reel1 === reel2 && reel2 === reel3) {
      if (reel1 === '7️⃣') {
        winnings = bet * 50;
        result = 'JACKPOT! 🎉';
      } else if (reel1 === '💎') {
        winnings = bet * 25;
        result = 'DIAMOND WIN! 💎';
      } else if (reel1 === '🔔') {
        winnings = bet * 15;
        result = 'BELLS WIN! 🔔';
      } else {
        winnings = bet * 10;
        result = 'MATCH!';
      }
    } else if (reel1 === reel2 || reel2 === reel3 || reel1 === reel3) {
      winnings = bet * 2;
      result = 'Small win!';
    }
    
    if (winnings > 0 && dbManager) {
      dbManager.addBalance(interaction.user.id, interaction.guildId, winnings);
    }
    
    const netProfit = winnings - bet;
    
    const embed = new EmbedBuilder()
      .setTitle('🎰 Slot Machine')
      .setDescription(`🎰 ${reel1} | ${reel2} | ${reel3} 🎰`)
      .addFields(
        { name: 'Bet', value: bet.toString() },
        { name: 'Winnings', value: winnings.toString() },
        { name: 'Result', value: result || 'No win' },
        { name: 'Net', value: (netProfit >= 0 ? '+' : '') + netProfit }
      )
      .setColor(netProfit > 0 ? 0x00ff00 : netProfit < 0 ? 0xff0000 : 0xffff00);
    
    await interaction.reply({ embeds: [embed] });
  }
};