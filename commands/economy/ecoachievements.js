/**
 * Economy Achievements Command
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ecoachievements')
    .setDescription('View your economy achievements'),
  
  async execute(interaction, client) {
    const embed = new EmbedBuilder()
      .setTitle('🏆 Economy Achievements')
      .setDescription('Your achievements:')
      .addFields(
        { name: 'First Win', value: '✅ Won first bet', inline: true },
        { name: 'Millionaire', value: '❌ Reach 1M coins', inline: true },
        { name: 'Generous', value: '✅ Gifted 1000 coins', inline: true },
        { name: 'Gambler', value: '✅ Lost 50 times', inline: true },
        { name: 'Banker', value: '❌ Deposit 10K in bank', inline: true }
      )
      .setColor(0xffd700);
    
    await interaction.reply({ embeds: [embed] });
  }
};