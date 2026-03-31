/**
 * Ship Command - Ship two users together
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

function randomize(a, b) {
  return Math.floor(Math.random() * (b - a + 1)) + a;
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ship')
    .setDescription('Ship two users together')
    .addUserOption(option =>
      option.setName('user1')
        .setDescription('First user')
        .setRequired(true)
    )
    .addUserOption(option =>
      option.setName('user2')
        .setDescription('Second user')
        .setRequired(true)
    ),
  
  async execute(interaction, client) {
    const user1 = interaction.options.getUser('user1');
    const user2 = interaction.options.getUser('user2');
    
    const percentage = randomize(0, 100);
    
    let message;
    if (percentage >= 90) {
      message = '💕 Soulmates! A perfect match!';
    } else if (percentage >= 70) {
      message = '❤️ Great match! Love is in the air!';
    } else if (percentage >= 50) {
      message = '💜 There might be something there...';
    } else if (percentage >= 30) {
      message = '💙 Friends maybe? Give it time!';
    } else {
      message = '💔 Better stay just friends...';
    }
    
    const shipName = `${user1.username.slice(0, 3)}${user2.username.slice(-2)}`.toLowerCase();
    
    const embed = new EmbedBuilder()
      .setTitle('💘 Shipping Result')
      .setDescription(`**${user1.username}** x **${user2.username}**`)
      .addFields(
        { name: '💖 Love Percentage', value: `${percentage}%` },
        { name: '📝 Ship Name', value: shipName },
        { name: '💬 Result', value: message }
      )
      .setColor(0xff69b4);
    
    if (user1.avatar) {
      embed.setThumbnail(`https://cdn.discordapp.com/avatars/${user1.id}/${user1.avatar}.png?size=256`);
    }
    
    await interaction.reply({ embeds: [embed] });
  }
};