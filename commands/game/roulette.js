/**
 * Roulette Game Command
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const db = require('../../database');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('roulette')
    .setDescription('Play Russian Roulette for coins')
    .addIntegerOption(option => option.setName('bet').setDescription('Amount to bet').setRequired(true)),
  
  async execute(interaction, client) {
    const bet = interaction.options.getInteger('bet');
    const user = interaction.user;
    const balance = db.getBalance(user.id);
    
    if (bet > balance) {
      return interaction.reply({ content: '❌ You don\'t have enough coins!', ephemeral: true });
    }
    
    const chambers = 6;
    const bullet = Math.floor(Math.random() * chambers);
    const spin = Math.floor(Math.random() * chambers);
    
    db.removeBalance(user.id, bet);
    
    if (spin === bullet) {
      const win = bet * 2;
      db.addBalance(user.id, win);
      
      const embed = new EmbedBuilder()
        .setTitle('🎯 Survived!')
        .setDescription(`You survived!\n\nYou won **${win}** coins!`)
        .setColor(0x00ff00);
      
      return interaction.reply({ embeds: [embed] });
    }
    
    const embed = new EmbedBuilder()
      .setTitle('💀 BANG!')
      .setDescription('You lost!\n\nBetter luck next time...')
      .setColor(0xff0000);
    
    await interaction.reply({ embeds: [embed] });
  }
};