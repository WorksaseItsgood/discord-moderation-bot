/**
 * Rob Command - Rob another user
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const db = require('../../database');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('rob')
    .setDescription('Rob a user')
    .addUserOption(option => option.setName('user').setDescription('User to rob').setRequired(true)),
  
  async execute(interaction, client) {
    const target = interaction.options.getUser('user');
    const robAmount = Math.floor(Math.random() * 500) + 100;
    const user = interaction.user;
    const balance = db.getBalance(user.id);
    
    if (balance < 100) {
      return interaction.reply({ content: '❌ You need at least 100 coins to rob!', ephemeral: true });
    }
    
    const success = Math.random() > 0.5;
    
    if (success) {
      db.addBalance(user.id, robAmount);
      
      const embed = new EmbedBuilder()
        .setTitle('💰 Robbery Success!')
        .setDescription(`You robbed **${robAmount}** coins from ${target.username}!`)
        .setColor(0x00ff00);
      
      return interaction.reply({ embeds: [embed] });
    }
    
    db.removeBalance(user.id, 50);
    
    const embed = new EmbedBuilder()
      .setTitle('❌ Robbery Failed!')
      .setDescription('The police caught you! You lost 50 coins...')
      .setColor(0xff0000);
    
    await interaction.reply({ embeds: [embed] });
  }
};