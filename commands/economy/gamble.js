/**
 * Gamble Command
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const db = require('../../database');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('gamble')
    .setDescription('Gamble your coins')
    .addIntegerOption(option => option.setName('bet').setDescription('Bet amount').setRequired(true)),
  
  async execute(interaction, client) {
    const bet = interaction.options.getInteger('bet');
    const user = interaction.user;
    const balance = db.getBalance(user.id);
    
    if (bet > balance) {
      return interaction.reply({ content: '❌ Not enough coins!', ephemeral: true });
    }
    
    db.removeBalance(user.id, bet);
    const win = Math.random() > 0.5;
    const multiplier = Math.random() * 3 + 1;
    
    if (win) {
      const winnings = Math.floor(bet * multiplier);
      db.addBalance(user.id, winnings);
      return interaction.reply({ content: `🎰 You won **${winnings}** coins! (x${multiplier.toFixed(1)})` });
    }
    
    await interaction.reply({ content: '🎰 You lost! Better luck next time.' });
  }
};