/**
 * Deposit Command
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const db = require('../../database');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('deposit')
    .setDescription('Deposit coins to bank')
    .addIntegerOption(option => option.setName('amount').setDescription('Amount').setRequired(true)),
  
  async execute(interaction, client) {
    const amount = interaction.options.getInteger('amount');
    const user = interaction.user;
    const balance = db.getBalance(user.id);
    
    if (amount > balance) {
      return interaction.reply({ content: '❌ Not enough coins!', ephemeral: true });
    }
    
    db.removeBalance(user.id, amount);
    db.addBank(user.id, amount);
    
    await interaction.reply({ content: `🏦 You deposited **${amount}** coins!` });
  }
};