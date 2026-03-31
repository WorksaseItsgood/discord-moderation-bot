const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('soundlist')
    .setDescription('List available sounds'),
  async execute(interaction) {
    const sounds = [
      'airhorn - 🔊 Classic airhorn',
      'cricket - 🦗 Cricket chirp',
      'danger - ⚠️ Warning',
      'yeet - 🎯 Yeet sound',
      'wow - 😲 Wow sound',
      'sad - 😢 Sad trombone',
      'vine-boom - 💥 Vine boom',
      'rimshot - 🥁 Rimshot',
      'wrong - ❌ Wrong buzzer',
      'taco - 🌮 Taco Tuesday',
    ];

    const embed = {
      title: '🔊 Available Sounds',
      description: sounds.map(s => `• ${s}`).join('\n'),
      color: 0x5865F2,
      timestamp: new Date().toISOString(),
    };

    await interaction.reply({ embeds: [embed] });
  },
};