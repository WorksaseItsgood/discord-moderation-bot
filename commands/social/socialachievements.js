/**
 * Social Achievements Command
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('socialachievements')
    .setDescription('View social achievements'),
  
  async execute(interaction, client) {
    const embed = new EmbedBuilder()
      .setTitle('🏆 Social Achievements')
      .setDescription('Your badges:')
      .addFields(
        { name: 'Social Butterfly', value: '❌ Talk to 100 members', inline: true },
        { name: 'Friend of All', value: '❌ Add 50 friends', inline: true },
        { name: 'Matchmaker', value: '❌ Ship 10 couples', inline: true }
      )
      .setColor(0xffd700);
    
    await interaction.reply({ embeds: [embed] });
  }
};