const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

// Fortune command - get a fortune cookie
const fortunes = [
  'You will have a great day! 🌟',
  'Something unexpected is coming your way! 🎁',
  'Your hard work will pay off soon! 💪',
  'Be careful with decisions today ⚖️',
  'A friend will ask for a favor 🤝',
  'Your creativity will shine today! ✨',
  'Good news is coming your way! 📰',
  'Trust your instincts - they are right! 🧠',
  'A surprise await you around the corner! 🎉',
  'Today is a good day for new beginnings! 🌅',
  'Someone thinks of you fondly 💕',
  'Your patience will be rewarded ⏳',
  'An opportunity will arise soon! 🚀',
  'You will find what you lost 🔍',
  'Happiness is closer than you think 😊'
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('fortune')
    .setDescription('Get a fortune cookie'),
  async execute(interaction, client) {
    const fortune = fortunes[Math.floor(Math.random() * fortunes.length)];
    
    const embed = new EmbedBuilder()
      .setTitle('🥠 Fortune Cookie')
      .setColor(0xffaa00)
      .setDescription(fortune);
    
    await interaction.reply({ embeds: [embed] });
  }
};