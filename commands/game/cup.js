/**
 * Cup Game Command - Guess which cup the ball is under
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const db = require('../../database');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('cup')
    .setDescription('Guess which cup the ball is under')
    .addIntegerOption(option => option.setName('bet').setDescription('Bet amount').setRequired(true)),
  
  async execute(interaction, client) {
    const bet = interaction.options.getInteger('bet');
    const user = interaction.user;
    const balance = db.getBalance(user.id);
    
    if (bet > balance) {
      return interaction.reply({ content: '❌ Not enough coins!', ephemeral: true });
    }
    
    const correct = Math.floor(Math.random() * 3) + 1;
    const choice = Math.floor(Math.random() * 3) + 1;
    
    db.removeBalance(user.id, bet);
    
    if (choice === correct) {
      const win = bet * 3;
      db.addBalance(user.id, win);
      
      const embed = new EmbedBuilder()
        .setTitle('🏆 You Won!')
        .setDescription(`The ball was under cup ${correct}!\n\nYou won **${win}** coins!`)
        .setColor(0x00ff00);
      
      return interaction.reply({ embeds: [embed] });
    }
    
    const embed = new EmbedBuilder()
      .setTitle('❌ Wrong!')
      .setDescription(`The ball was under cup ${correct}!\n\nYou guessed cup ${choice}...`)
      .setColor(0xff0000);
    
    await interaction.reply({ embeds: [embed] });
  }
};