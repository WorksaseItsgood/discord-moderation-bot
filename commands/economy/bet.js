/**
 * Bet Command
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const db = require('../../database');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('bet')
    .setDescription('Make a bet on any outcome')
    .addStringOption(option => option.setName('prediction').setDescription('Your prediction').setRequired(true))
    .addIntegerOption(option => option.setName('amount').setDescription('Amount').setRequired(true)),
  
  async execute(interaction, client) {
    const prediction = interaction.options.getString('prediction');
    const amount = interaction.options.getInteger('amount');
    const user = interaction.user;
    
    if (db.getBalance(user.id) < amount) {
      return interaction.reply({ content: '❌ Not enough coins!', ephemeral: true });
    }
    
    db.removeBalance(user.id, amount);
    const outcome = Math.random() > 0.5;
    
    if (outcome) {
      db.addBalance(user.id, amount * 2);
      return interaction.reply({ content: `🎯 Your prediction was right! You won **${amount * 2}** coins!` });
    }
    
    await interaction.reply({ content: `❌ "${prediction}" was wrong. You lost ${amount} coins.` });
  }
};