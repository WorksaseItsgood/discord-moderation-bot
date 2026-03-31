const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('danger')
    .setDescription('🛑🛑🛑 Danger! 🛑🛑🛑'),
  async execute(interaction) {
    const dangers = [
      '🛑🛑🛑\nDANGER!\n🛑🛑🛑',
      '⚠️⚠️⚠️\nWARNING\n⚠️⚠️⚠️',
      '🚨🚨🚨\nDANGER\n🚨🚨🚨',
      '🛑🛑🛑\nWATCH OUT!\n🛑🛑🛑',
    ];

    await interaction.reply({ content: dangers[Math.floor(Math.random() * dangers.length)] });
  },
};