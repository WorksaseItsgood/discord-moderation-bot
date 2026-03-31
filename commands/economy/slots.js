/**
 * Slots Command
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const db = require('../../database');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('slots')
    .setDescription('Play the slot machine')
    .addIntegerOption(option => option.setName('bet').setDescription('Bet amount').setRequired(true)),
  
  async execute(interaction, client) {
    const bet = interaction.options.getInteger('bet');
    const user = interaction.user;
    const balance = db.getBalance(user.id);
    
    if (bet > balance) {
      return interaction.reply({ content: '❌ Not enough coins!', ephemeral: true });
    }
    
    const symbols = ['🍒', '🍋', '🍊', '🍇', '💎', '7️⃣'];
    const spin = [
      symbols[Math.floor(Math.random() * symbols.length)],
      symbols[Math.floor(Math.random() * symbols.length)],
      symbols[Math.floor(Math.random() * symbols.length)]
    ];
    
    db.removeBalance(user.id, bet);
    
    let winnings = 0;
    if (spin[0] === spin[1] && spin[1] === spin[2]) {
      winnings = bet * 10;
    } else if (spin[0] === spin[1] || spin[1] === spin[2]) {
      winnings = bet * 2;
    }
    
    if (winnings > 0) {
      db.addBalance(user.id, winnings);
    }
    
    const embed = new EmbedBuilder()
      .setTitle('🎰 Slots')
      .setDescription(`${spin.join(' | ')}\n\n${winnings > 0 ? `You won **${winnings}** coins!` : 'Better luck next time!'}`)
      .setColor(winnings > 0 ? 0x00ff00 : 0xff0000);
    
    await interaction.reply({ embeds: [embed] });
  }
};