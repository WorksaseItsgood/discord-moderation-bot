const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('bomb')
    .setDescription('Drop a bomb (Telegram-style bomb effect!)')
    .addUserOption(option =>
      option.setName('target')
        .setDescription('Who to bomb')
        .setRequired(true)),
  async execute(interaction) {
    const target = interaction.options.getUser('target');

    const frames = [
      '💣 Placing bomb...',
      '⏰ 5...',
      '⏰ 4...',
      '⏰ 3...',
      '⏰ 2...',
      '⏰ 1...',
      '💥 BOOM!',
      '💀 Target eliminated!'
    ];

    await interaction.reply(`💣 **${interaction.user}** is dropping a bomb on **${target}**!`);

    for (let i = 0; i < frames.length; i++) {
      setTimeout(async () => {
        await interaction.followUp(frames[i]);
      }, i * 1000);
    }
  },
};