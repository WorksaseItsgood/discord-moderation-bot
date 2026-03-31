/**
 * Steal Command - Attempt to steal coins
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const db = require('../../database');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('steal')
    .setDescription('Attempt to steal coins')
    .addUserOption(option => option.setName('user').setDescription('User to steal from').setRequired(true)),
  
  async execute(interaction, client) {
    const target = interaction.options.getUser('user');
    const user = interaction.user;
    
    if (Math.random() > 0.4) {
      const amount = Math.floor(Math.random() * 200) + 50;
      db.addBalance(user.id, amount);
      
      return interaction.reply({ content: `😎 You successfully stole **${amount}** coins from ${target.username}!` });
    }
    
    db.removeBalance(user.id, 25);
    await interaction.reply({ content: '😰 You got caught! You lost 25 coins...' });
  }
};