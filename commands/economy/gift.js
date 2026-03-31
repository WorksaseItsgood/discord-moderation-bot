/**
 * Gift Command - Gift coins to another user
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const db = require('../../database');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('gift')
    .setDescription('Gift coins to another user')
    .addUserOption(option => option.setName('user').setDescription('User to gift to').setRequired(true))
    .addIntegerOption(option => option.setName('amount').setDescription('Amount to gift').setRequired(true)),
  
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
    
    await interaction.reply({ content: `🎁 You gifted **${amount}** coins to ${target.username}!` });
  }
};