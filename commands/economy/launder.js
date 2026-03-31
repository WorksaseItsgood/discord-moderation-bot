/**
 * Launder Command - Launder coins
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const db = require('../../database');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('launder')
    .setDescription('Launder your coins for a clean start')
    .addIntegerOption(option => option.setName('amount').setDescription('Amount to launder').setRequired(true)),
  
  async execute(interaction, client) {
    const amount = interaction.options.getInteger('amount');
    const user = interaction.user;
    const balance = db.getBalance(user.id);
    
    if (amount > balance) {
      return interaction.reply({ content: '❌ Not enough coins!', ephemeral: true });
    }
    
    const fee = Math.floor(amount * 0.1);
    const cleaned = amount - fee;
    
    db.removeBalance(user.id, amount);
    db.addBalance(user.id, cleaned);
    
    await interaction.reply({ content: `🧼 You laundered **${cleaned}** coins (fee: ${fee})!` });
  }
};