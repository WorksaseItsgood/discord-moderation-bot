/**
 * Withdraw Command
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const db = require('../../database');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('withdraw')
    .setDescription('Withdraw coins from bank')
    .addIntegerOption(option => option.setName('amount').setDescription('Amount').setRequired(true)),
  
  async execute(interaction, client) {
    const amount = interaction.options.getInteger('amount');
    const user = interaction.user;
    const bank = db.getBank(user.id);
    
    if (amount > bank) {
      return interaction.reply({ content: '❌ Not enough coins in bank!', ephemeral: true });
    }
    
    db.removeBank(user.id, amount);
    db.addBalance(user.id, amount);
    
    await interaction.reply({ content: `💵 You withdrew **${amount}** coins!` });
  }
};