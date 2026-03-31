const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('countdown')
    .setDescription('Countdown to a date')
    .addStringOption(option =>
      option.setName('date')
        .setDescription('Target date (YYYY-MM-DD)')
        .setRequired(true)),
  async execute(interaction) {
    const dateStr = interaction.options.getString('date');
    const target = new Date(dateStr);
    const now = new Date();
    
    if (isNaN(target.getTime())) {
      return interaction.reply({ content: '❌ Invalid date format! Use YYYY-MM-DD', ephemeral: true });
    }
    
    const diff = target - now;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    const embed = {
      title: '⏰ Countdown',
      description: `**Target:** ${dateStr}\n\n**Time remaining:**\n${days} days, ${hours} hours, ${minutes} minutes`,
      color: 0x5865F2,
      timestamp: new Date().toISOString(),
    };

    await interaction.reply({ embeds: [embed] });
  },
};