const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

// Love command - Love calculator
module.exports = {
  data: new SlashCommandBuilder()
    .setName('love')
    .setDescription('Calculate love compatibility')
    .addUserOption(option =>
      option.setName('user1')
        .setDescription('First person')
        .setRequired(true))
    .addUserOption(option =>
      option.setName('user2')
        .setDescription('Second person')
        .setRequired(true)),
  async execute(interaction, client) {
    const user1 = interaction.options.getUser('user1');
    const user2 = interaction.options.getUser('user2');
    
    // Generate consistent love percentage based on user IDs
    const combined = user1.id + user2.id;
    let hash = 0;
    for (let i = 0; i < combined.length; i++) {
      const charCode = combined.charCodeAt(i);
      hash = ((hash << 5) - hash) + charCode;
      hash = hash | 0;
    }
    const lovePercent = Math.abs(hash) % 101;
    
    let message;
    if (lovePercent >= 90) {
      message = 'Perfect match!';
    } else if (lovePercent >= 70) {
      message = 'Great compatibility!';
    } else if (lovePercent >= 50) {
      message = 'There might be something there...';
    } else if (lovePercent >= 30) {
      message = 'It might take some work...';
    } else {
      message = 'Better stay friends...';
    }
    
    const embed = new EmbedBuilder()
      .setTitle('Love Calculator')
      .setColor(0xff69b4)
      .setDescription(user1.toString() + ' + ' + user2.toString())
      .addFields([
        { name: 'Love Score', value: lovePercent + '%', inline: true },
        { name: 'Verdict', value: message, inline: true }
      ]);
    
    await interaction.reply({ embeds: [embed] });
  }
};