const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('unflip')
    .setDescription('Unflip a table (animation)'),
  async execute(interaction) {
    const unflips = [
      '┬─┬ノ(°□°ノ)\n(hold)!',
      '┬─┬ ノ(°□°)\nNice there',
      '(put table back)\n┬─┬ノ',
      '┬─┬\n(calm)',
    ];

    await interaction.reply({ content: unflips[Math.floor(Math.random() * unflips.length)] });
  },
};