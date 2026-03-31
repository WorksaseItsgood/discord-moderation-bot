/**
 * Ship Command - Ship two users
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ship')
    .setDescription('Ship two users')
    .addUserOption(option => option.setName('user1').setDescription('First user').setRequired(true))
    .addUserOption(option => option.setName('user2').setDescription('Second user').setRequired(true)),
  
  async execute(interaction, client) {
    const user1 = interaction.options.getUser('user1');
    const user2 = interaction.options.getUser('user2');
    const percentage = Math.floor(Math.random() * 101);
    
    const embed = new EmbedBuilder()
      .setTitle('💕 Ship')
      .setDescription(`${user1.username} ❤️ ${user2.username}\n\n**${percentage}%** match!`)
      .setColor(percentage > 50 ? 0xff0000 : 0x888888);
    
    await interaction.reply({ embeds: [embed] });
  }
};