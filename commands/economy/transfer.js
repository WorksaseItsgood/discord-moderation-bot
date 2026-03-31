/**
 * Transfer Command - Transfer coins to another user
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const db = require('../../database');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('transfer')
    .setDescription('Transfer coins to another user')
    .addUserOption(option => option.setName('user').setDescription('User').setRequired(true))
    .addIntegerOption(option => option.setName('amount').setDescription('Amount').setRequired(true)),
  
  async execute(interaction, client) {
    const target = interaction.options.getUser('user');
    const amount = interaction.options.getInteger('amount');
    const user = interaction.user;
    const balance = db.getBalance(user.id);
    
    if (amount > balance) {
      return interaction.reply({ content: '❌ Not enough coins!', ephemeral: true });
    }
    
    db.removeBalance(user.id, amount);
    db.addBalance(target.id, amount);
    
    await interaction.reply({ content: `💸 You transferred **${amount}** coins to ${target.username}!` });
  }
};