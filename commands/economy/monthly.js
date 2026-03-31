/**
 * Monthly Command - Monthly coins
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const db = require('../../database');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('monthly')
    .setDescription('Claim your monthly allowance'),
  
  async execute(interaction, client) {
    const user = interaction.user;
    const amount = 25000;
    
    db.addBalance(user.id, amount);
    
    const embed = new EmbedBuilder()
      .setTitle('💰 Monthly Allowance')
      .setDescription(`You claimed **${amount}** coins!`)
      .setColor(0x00ff00);
    
    await interaction.reply({ embeds: [embed] });
  }
};