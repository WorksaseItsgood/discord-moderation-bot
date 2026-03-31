const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('beautiful')
    .setDescription('Rate beauty (for fun)')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('User to rate')
        .setRequired(true)),
  async execute(interaction) {
    const user = interaction.options.getUser('user');
    const score = Math.floor(Math.random() * 100) + 1;
    
    let rating = '';
    if (score >= 90) rating = '🔥 Absolute stunner!';
    else if (score >= 70) rating = '✨ Gorgeous!';
    else if (score >= 50) rating = '😊 Not bad!';
    else if (score >= 30) rating = '😐 Could be worse';
    else rating = '💀 Yikes...';

    const embed = {
      title: '✨ Beauty Rating',
      description: `**User:** ${user}\n**Score:** ${score}/100\n\n${rating}`,
      color: score >= 50 ? 0xFF69B4 : 0xFF0000,
      timestamp: new Date().toISOString(),
    };

    await interaction.reply({ embeds: [embed] });
  },
};