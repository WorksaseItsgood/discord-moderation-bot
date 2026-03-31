/**
 * Fortune Command
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('fortune')
    .setDescription('Get your fortune'),
  
  async execute(interaction, client) {
    const fortunes = [
      'A great journey awaits you!',
      'Good news will come to you soon.',
      'Your hard work will pay off.',
      'A new opportunity is around the corner.',
      'Trust your instincts - they are right.',
      'Your smile is your best asset.',
      'Something exciting is about to happen!'
    ];
    
    const fortune = fortunes[Math.floor(Math.random() * fortunes.length)];
    
    const embed = new EmbedBuilder()
      .setTitle('🔮 Your Fortune')
      .setDescription(fortune)
      .setColor(0xff00ff);
    
    await interaction.reply({ embeds: [embed] });
  }
};