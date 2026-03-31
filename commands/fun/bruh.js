const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('bruh')
    .setDescription('Bruh sound effect'),
  async execute(interaction) {
    const sounds = [
      '**bruh** 😤',
      '**BRUH** 🔥',
      '*bruh* 💀',
      '**B R U H** 🤔',
      'bruh moment 💁',
      'bruh 💨',
    ];

    await interaction.reply({ content: sounds[Math.floor(Math.random() * sounds.length)] });
  },
};