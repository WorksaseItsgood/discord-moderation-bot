/**
 * Weekly Command - Weekly coins
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const db = require('../../database');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('weekly')
    .setDescription('Claim your weekly allowance'),
  
  async execute(interaction, client) {
    const user = interaction.user;
    const amount = 5000;
    
    db.addBalance(user.id, amount);
    
    const embed = new EmbedBuilder()
      .setTitle('💰 Weekly Allowance')
      .setDescription(`You claimed **${amount}** coins!`)
      .setColor(0x00ff00);
    
    await interaction.reply({ embeds: [embed] });
  }
};