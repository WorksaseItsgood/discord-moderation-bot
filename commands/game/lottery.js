/**
 * Lottery Command
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const db = require('../../database');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('lottery')
    .setDescription('Play the lottery for a chance to win big!')
    .addIntegerOption(option => option.setName('tickets').setDescription('Number of tickets (10 coins each)').setMaxValue(10).setMinValue(1).setRequired(false)),
  
  async execute(interaction, client) {
    const tickets = interaction.options.getInteger('tickets') || 1;
    const cost = tickets * 10;
    const user = interaction.user;
    const balance = db.getBalance(user.id);
    
    if (cost > balance) {
      return interaction.reply({ content: '❌ Not enough coins! Each ticket costs 10 coins.', ephemeral: true });
    }
    
    db.removeBalance(user.id, cost);
    
    const numbers = [];
    for (let i = 0; i < tickets; i++) {
      const nums = [];
      for (let j = 0; j < 5; j++) {
        nums.push(Math.floor(Math.random() * 50) + 1);
      }
      numbers.push(nums);
    }
    
    const winning = [];
    for (let i = 0; i < 5; i++) {
      winning.push(Math.floor(Math.random() * 50) + 1);
    }
    
    let matches = 0;
    for (const ticket of numbers) {
      const matched = ticket.filter(n => winning.includes(n)).length;
      if (matched > matches) matches = matched;
    }
    
    const prizes = { 1: 20, 2: 100, 3: 500, 4: 2000, 5: 100000 };
    const winnings = prizes[matches] || 0;
    
    if (winnings > 0) {
      db.addBalance(user.id, winnings);
    }
    
    const embed = new EmbedBuilder()
      .setTitle('🎰 Lottery Results')
      .setDescription(`Winning numbers: ${winning.join(', ')}\n\nYour tickets: ${numbers.map(t => t.join(', ')).join(' | ')}\n\nMatches: ${matches}\n\n${winnings > 0 ? `You won **${winnings}** coins!` : 'Better luck next time!'}`)
      .setColor(winnings > 0 ? 0x00ff00 : 0xff0000);
    
    await interaction.reply({ embeds: [embed] });
  }
};